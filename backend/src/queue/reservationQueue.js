"use strict";

const {sequelize,Reservation,Member,Book,Rental,MemberWallet,LibrarianWallet,WalletTransaction,} = require("../models");

const { redisConnection } = require("../config/redis");
const { Op } = require("sequelize");

// ======================================================
// CONSTANTS
// ======================================================


const RENTAL_RATE_PER_DAY = 1;
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

const processReservationQueue = async (bookId) => {
  // ----------------------------------------------------
  // 1. BOOK CHECK
  // ----------------------------------------------------

  const bookExists = await Book.findByPk(bookId);

  if (!bookExists) {
    throw createError("Book not found", 404);
  }
  const skippedReservationIds = new Set(); //ek empty Set collection create karna.  Set JavaScript ka collection hota hai jisme duplicate values store nahi hoti.

  while (true) {
    const transaction = await sequelize.transaction();

    try {
      const reservationWhere = {
        bookId,
        status: {
          [Op.in]: ["PENDING", "APPROVED"],
        },
      };

      if (skippedReservationIds.size > 0) {
        reservationWhere.id = { [Op.notIn]: [...skippedReservationIds],}; //Is list ke andar jo values hain, unko exclude karo.
      }

      const reservation = await Reservation.findOne({
        where: reservationWhere,

        order: [["reservedAt", "ASC"]],

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

      if (reservation.expiresAt && new Date() > new Date(reservation.expiresAt)) {
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
      // 11. GET MEMBER WALLET + LOCK
      // ------------------------------------------------

      const wallet = await MemberWallet.findOne({
          where: {
            memberId: reservation.memberId,
          },

          transaction,

          lock: transaction.LOCK.UPDATE,
        });

      if (!wallet) {
        await transaction.commit();

        return {
          success: true,
          processed: false,
          reason: "Member wallet not found",
        };
      }

      const librarianId = wallet.fundedByLibrarianId;

      if (!librarianId) {
        throw createError(
          "Member wallet funding librarian not found",
          400
        );
      }

      let librarianWallet = await LibrarianWallet.findOne({
        where: {
          librarianId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!librarianWallet) {
        librarianWallet = await LibrarianWallet.create(
          {
            librarianId,
            balance: 0,
          },
          {
            transaction,
          }
        );
      }

      // ------------------------------------------------
      // 12. RENTAL AMOUNT
      // ------------------------------------------------

      const rentalDays = DEFAULT_RENTAL_DAYS;

      const rentalAmount = rentalDays *  RENTAL_RATE_PER_DAY;

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
      // ✅ Queue first-in-first-out rahegi
      //

      if (balanceBefore < rentalAmount) {
        await transaction.commit();

        skippedReservationIds.add(reservation.id);
        continue;
      }

      // ------------------------------------------------
      // 14. CALCULATE BALANCE AFTER
      // ------------------------------------------------

      const balanceAfter = balanceBefore - rentalAmount;

      // ------------------------------------------------
      // 15. RENTAL DATE
      // ------------------------------------------------

      const rentedAt = new Date();

      // ------------------------------------------------
      // 16. DUE DATE
      // ------------------------------------------------

      const dueDate = new Date(rentedAt);

      dueDate.setDate(dueDate.getDate() + rentalDays);

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

          librarianId,

          rentedAt,

          dueDate,

          rentalAmount,

          quantity: 1,

          settlementStatus: "SETTLED",

          settledAt: rentedAt,

          status: "ACTIVE",
        },
        {
          transaction,
        }
      );

      // ------------------------------------------------
      // 19. DECREASE BOOK COPY
      // ------------------------------------------------

      const newAvailableCopies = Number(book.availableCopies) - 1;

      await book.update(
        {
          availableCopies:
            newAvailableCopies,

          status:
            newAvailableCopies === 0? "UNAVAILABLE" : "AVAILABLE",
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

      const librarianBalanceBefore =
        Number(librarianWallet.balance);

      const librarianBalanceAfter =
        librarianBalanceBefore + rentalAmount;

      await librarianWallet.update(
        {
          balance: librarianBalanceAfter,
        },
        {
          transaction,
        }
      );

      await WalletTransaction.create(
        {
          walletType: "LIBRARIAN",
          walletId: librarianWallet.id,
          type: "CREDIT",
          amount: rentalAmount,
          balanceBefore: librarianBalanceBefore,
          balanceAfter: librarianBalanceAfter,
          description: `Reservation rental income - ${book.title}`,
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

      await redisConnection.del("reservations:all");
      await redisConnection.del("books:all");
      await redisConnection.del("rentals:all");
      await redisConnection.del(`rentals:member:${reservation.memberId}`);

      // After assigning one available copy, continue processing
      // if more copies are available and more approved reservations exist.
      if (Number(book.availableCopies) > 0) {
        continue;
      }

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