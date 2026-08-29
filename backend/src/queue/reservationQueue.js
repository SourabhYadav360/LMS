"use strict";

const {
  sequelize,
  Sequelize,
  Reservation,
  Member,
  Book,
  Rental,
  MemberWallet,
  WalletTransaction,
} = require("../models");

// ======================================================
// CONSTANTS
// ======================================================

// Requirement:
// Rental = ₹1 per day
const RENTAL_RATE_PER_DAY = 1;

// Reservation se automatically kitne din ka rental create hoga
const DEFAULT_RENTAL_DAYS = 1;

// ======================================================
// ERROR HELPER
// ======================================================

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// ======================================================
// PROCESS RESERVATION QUEUE
// ======================================================
//
// FIFO:
//
// Oldest reservation → pehle check
//       ↓
// Balance sufficient?
//   YES ↓
// Rental create
// Wallet deduct
// Book assign
//
//   NO ↓
// Reservation PENDING rahegi
//       ↓
// Next reservation check
//
// ======================================================

const processReservationQueue = async (bookId) => {
  // ----------------------------------------------------
  // 1. BOOK CHECK
  // ----------------------------------------------------

  const bookExists = await Book.findByPk(bookId);

  if (!bookExists) {
    throw createError("Book not found", 404);
  }

  // ----------------------------------------------------
  // 2. FIFO LOOP
  // ----------------------------------------------------
  //
  // Important:
  // Ek book ki available copy ek hi reservation ko milegi.
  //
  // Agar insufficient balance wale member ko skip kar diya,
  // to next member check hoga.
  //
  // Successful assignment ke baad function stop hoga.
  //

  while (true) {
    const transaction = await sequelize.transaction();

    try {
      // ------------------------------------------------
      // 3. GET OLDEST PENDING RESERVATION
      // ------------------------------------------------
      //
      // createdAt ASC = FIFO
      //
      // Sabse purani reservation pehle.
      //

      const reservation = await Reservation.findOne({
        where: {
          bookId,

          status: "PENDING",
        },

        order: [["createdAt", "ASC"]],

        transaction,

        lock: transaction.LOCK.UPDATE,
      });

      // ------------------------------------------------
      // 4. NO PENDING RESERVATION
      // ------------------------------------------------

      if (!reservation) {
        await transaction.commit();

        return {
          success: true,
          processed: false,
          reason: "No pending reservation",
        };
      }

      // ------------------------------------------------
      // 5. EXPIRY CHECK
      // ------------------------------------------------

      if (
        reservation.expiresAt &&
        new Date() > new Date(reservation.expiresAt)
      ) {
        await reservation.update(
          {
            status: "EXPIRED",
          },
          {
            transaction,
          }
        );

        await transaction.commit();

        // Next FIFO reservation
        continue;
      }

      // ------------------------------------------------
      // 6. MEMBER CHECK
      // ------------------------------------------------

      const member = await Member.findByPk(
        reservation.memberId,
        {
          transaction,
        }
      );

      if (!member) {
        await reservation.update(
          {
            status: "EXPIRED",
          },
          {
            transaction,
          }
        );

        await transaction.commit();

        // Next reservation
        continue;
      }

      // ------------------------------------------------
      // 7. MEMBER ACTIVE CHECK
      // ------------------------------------------------

      if (member.status !== "ACTIVE") {
        // Inactive member queue ko block nahi karega.

        await reservation.update(
          {
            status: "EXPIRED",
          },
          {
            transaction,
          }
        );

        await transaction.commit();

        // Next FIFO member
        continue;
      }

      // ------------------------------------------------
      // 8. GET BOOK + LOCK
      // ------------------------------------------------

      const book = await Book.findByPk(bookId, {
        transaction,

        lock: transaction.LOCK.UPDATE,
      });

      if (!book) {
        throw createError(
          "Book not found",
          404
        );
      }

      // ------------------------------------------------
      // 9. BOOK AVAILABLE CHECK
      // ------------------------------------------------

      if (Number(book.availableCopies) <= 0) {
        await transaction.commit();

        return {
          success: true,

          processed: false,

          reason: "Book is not available",
        };
      }

      // ------------------------------------------------
      // 10. ALREADY RENTED CHECK
      // ------------------------------------------------

      const existingRental =
        await Rental.findOne({
          where: {
            memberId: reservation.memberId,

            bookId,

            status: {
              [Sequelize.Op.in]: [
                "ACTIVE",
                "OVERDUE",
              ],
            },
          },

          transaction,
        });

      if (existingRental) {
        // Member already book rent kar chuka hai.
        // Is reservation ko complete karna logical hai
        // because same member ko same book dobara nahi dena.

        await reservation.update(
          {
            status: "COMPLETED",

            completedAt: new Date(),
          },
          {
            transaction,
          }
        );

        await transaction.commit();

        // Next reservation
        continue;
      }

      // ------------------------------------------------
      // 11. GET MEMBER WALLET + LOCK
      // ------------------------------------------------

      const wallet =
        await MemberWallet.findOne({
          where: {
            memberId: reservation.memberId,
          },

          transaction,

          lock: transaction.LOCK.UPDATE,
        });

      if (!wallet) {
        // Wallet nahi mila.
        // Reservation ko PENDING hi rakhenge.
        // Next member check hoga.

        await transaction.commit();

        continue;
      }

      // ------------------------------------------------
      // 12. RENTAL AMOUNT
      // ------------------------------------------------

      const rentalDays =
        DEFAULT_RENTAL_DAYS;

      const rentalAmount =
        rentalDays *
        RENTAL_RATE_PER_DAY;

      // ------------------------------------------------
      // 13. BALANCE CHECK
      // ------------------------------------------------

      const balanceBefore =
        Number(wallet.balance);

      // =================================================
      // IMPORTANT FIFO RULE
      // =================================================
      //
      // Balance insufficient:
      //
      // ❌ Reservation delete nahi
      // ❌ COMPLETED nahi
      // ❌ EXPIRED nahi
      //
      // ✅ PENDING rahegi
      // ✅ Next member check hoga
      //

      if (balanceBefore < rentalAmount) {
        await transaction.commit();

        // Next FIFO reservation
        continue;
      }

      // ------------------------------------------------
      // 14. CALCULATE BALANCE AFTER
      // ------------------------------------------------

      const balanceAfter =
        balanceBefore - rentalAmount;

      // ------------------------------------------------
      // 15. RENTAL DATE
      // ------------------------------------------------

      const rentedAt = new Date();

      // ------------------------------------------------
      // 16. DUE DATE
      // ------------------------------------------------

      const dueDate = new Date(rentedAt);

      dueDate.setDate(
        dueDate.getDate() + rentalDays
      );

      // ------------------------------------------------
      // 17. DEDUCT WALLET
      // ------------------------------------------------

      await wallet.update(
        {
          balance: balanceAfter,
        },
        {
          transaction,
        }
      );

      // ------------------------------------------------
      // 18. CREATE RENTAL
      // ------------------------------------------------

      const rental = await Rental.create(
        {
          memberId: reservation.memberId,

          bookId,

          rentedAt,

          dueDate,

          rentalAmount,

          status: "ACTIVE",
        },
        {
          transaction,
        }
      );

      // ------------------------------------------------
      // 19. DECREASE BOOK COPY
      // ------------------------------------------------

      const newAvailableCopies =
        Number(book.availableCopies) - 1;

      await book.update(
        {
          availableCopies:
            newAvailableCopies,

          status:
            newAvailableCopies === 0
              ? "UNAVAILABLE"
              : "AVAILABLE",
        },
        {
          transaction,
        }
      );

      // ------------------------------------------------
      // 20. WALLET TRANSACTION
      // ------------------------------------------------

      await WalletTransaction.create(
        {
          walletType: "MEMBER",

          walletId: wallet.id,

          type: "DEBIT",

          amount: rentalAmount,

          balanceBefore,

          balanceAfter,

          description:
            `Reservation rental payment - ${book.title}`,

          referenceType: "RENTAL",

          referenceId: rental.id,
        },
        {
          transaction,
        }
      );

      // ------------------------------------------------
      // 21. RESERVATION COMPLETED
      // ------------------------------------------------

      await reservation.update(
        {
          status: "COMPLETED",

          completedAt: new Date(),
        },
        {
          transaction,
        }
      );

      // ------------------------------------------------
      // 22. COMMIT
      // ------------------------------------------------

      await transaction.commit();

      // ------------------------------------------------
      // 23. SUCCESS RESPONSE
      // ------------------------------------------------

      return {
        success: true,

        processed: true,

        message:
          "Reservation processed successfully",

        reservation: {
          id: reservation.id,

          memberId:
            reservation.memberId,

          bookId:
            reservation.bookId,

          status: "COMPLETED",
        },

        rental: {
          id: rental.id,

          memberId:
            rental.memberId,

          bookId:
            rental.bookId,

          rentedAt: rental.rentedAt,

          dueDate: rental.dueDate,

          rentalDays,

          rentalAmount:
            Number(rental.rentalAmount),

          status: rental.status,
        },

        wallet: {
          balanceBefore,

          amountDeducted:
            rentalAmount,

          balanceAfter,
        },

        book: {
          id: book.id,

          title: book.title,

          availableCopies:
            newAvailableCopies,

          status:
            newAvailableCopies === 0
              ? "UNAVAILABLE"
              : "AVAILABLE",
        },
      };
    } catch (error) {
      // ------------------------------------------------
      // ROLLBACK
      // ------------------------------------------------

      await transaction.rollback();

      throw error;
    }
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  processReservationQueue,
};