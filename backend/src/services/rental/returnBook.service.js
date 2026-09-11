"use strict";

const {
  Rental,
  Book,
  MemberWallet,
  WalletTransaction,
  sequelize,
} = require("../../models");

const {
  processReservationQueue,
} = require("../../queue/reservationQueue");

const {
  redisConnection,
} = require("../../config/redis");

const FINE_PER_DAY = 1;

const createError = (
  message,
  statusCode = 400
) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const returnBook = async ({
  memberId,
  rentalId,
}) => {

  // ==================================================
  // 1. VALIDATION
  // ==================================================

  if (!memberId) {
    throw createError(
      "Member ID is required",
      400
    );
  }

  if (!rentalId) {
    throw createError(
      "Rental ID is required",
      400
    );
  }

  // ==================================================
  // 2. START TRANSACTION
  // ==================================================

  const transaction = await sequelize.transaction();

  try {

    // ==================================================
    // 3. FIND RENTAL
    // ==================================================

    const rental = await Rental.findOne({
        where: {
          id: rentalId,
          memberId,
        },

        transaction,

        lock:
          transaction.LOCK.UPDATE,
      });

    if (!rental) {
      throw createError(
        "Rental not found",
        404
      );
    }

    // ==================================================
    // 4. CHECK ALREADY RETURNED
    // ==================================================

    if (rental.status === "RETURNED"
    ) {
      throw createError(
        "Book has already been returned",
        400
      );
    }

    // ==================================================
    // 5. FIND AND LOCK BOOK
    // ==================================================

    const book =  await Book.findOne({
        where: {
          id: rental.bookId,
        },

        transaction,

        lock:
          transaction.LOCK.UPDATE,
      });

    if (!book) {
      throw createError(
        "Book not found",
        404
      );
    }

    // ==================================================
    // 6. FIND AND LOCK MEMBER WALLET
    // ==================================================

    const memberWallet = await MemberWallet.findOne({
        where: {
          memberId,
        },

        transaction,

        lock:
          transaction.LOCK.UPDATE,
      });

    if (!memberWallet) {
      throw createError(
        "Member wallet not found",
        404
      );
    }

    // ==================================================
    // 7. RETURN DATE
    // ==================================================

    const returnedAt =new Date();

    // ==================================================
    // 8. CALCULATE LATE DAYS
    // ==================================================

    const dueDate = new Date(rental.dueDate);

    const timeDifference =returnedAt.getTime() -dueDate.getTime();

    let lateDays = 0;

    if (timeDifference > 0) {

      lateDays = Math.ceil(timeDifference /(24 * 60 * 60 * 1000)
        );
    }

    // ==================================================
    // 9. CALCULATE FINE
    // ==================================================

    const fineAmount =
      lateDays * FINE_PER_DAY;

    // Existing pending fine
    const fineBefore =
      Number(memberWallet.fine || 0);

    // New pending fine
    const fineAfter =fineBefore + fineAmount;

    // ==================================================
    // 10. UPDATE MEMBER FINE
    // ==================================================

    if (fineAmount > 0) {

      await memberWallet.update(
        {
          fine: fineAfter,
        },
        {
          transaction,
        }
      );

      // Record fine transaction
      await WalletTransaction.create(
        {
          walletType:
            "MEMBER",

          walletId:
            memberWallet.id,

          type:
            "DEBIT",

          amount:
            fineAmount,

          balanceBefore:
            Number(
              memberWallet.balance || 0
            ),

          balanceAfter:
            Number(
              memberWallet.balance || 0
            ),

          description:
            `Late return fine: ${book.title}`,

          referenceType:
            "FINE",

          referenceId:
            rental.id,
        },
        {
          transaction,
        }
      );
    }

    // ==================================================
    // 11. UPDATE RENTAL
    // ==================================================

    await rental.update(
      {
        returnedAt,

        status:
          "RETURNED",

        settlementStatus:
          fineAmount > 0
            ? "PENDING"
            : "SETTLED",

        settledAt:
          fineAmount > 0
            ? null
            : returnedAt,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // 12. INCREASE BOOK STOCK
    // ==================================================

    const currentCopies =
      Number(
        book.availableCopies || 0
      );

    const rentalQuantity =
      Number(
        rental.quantity || 1
      );

    const newAvailableCopies =
      currentCopies +
      rentalQuantity;

    await book.update(
      {
        availableCopies:
          newAvailableCopies,

        status:
          "AVAILABLE",
      },
      {
        transaction,
      }
    );

    // ==================================================
    // 13. COMMIT TRANSACTION
    // ==================================================

    await transaction.commit();

    await redisConnection.del(
      `rentals:member:${memberId}`
    );

    await redisConnection.del(
      "rentals:all"
    );

    await redisConnection.del(
      "books:all"
    );

    // ==================================================
    // 14. PROCESS RESERVATION QUEUE
    // ==================================================

    try {

      await processReservationQueue(
        book.id
      );

    } catch (queueError) {

      console.error(
        "Reservation queue processing failed after return:",
        queueError
      );
    }

    // ==================================================
    // 15. RESPONSE
    // ==================================================

    return {

      rentalId:
        rental.id,

      bookId:
        rental.bookId,

      returnedAt,

      status:
        "RETURNED",

      lateDays,

      fineAmount,

      fineBefore,

      fineAfter,

      settlementStatus:
        fineAmount > 0
          ? "PENDING"
          : "SETTLED",

      book: {

        id:
          book.id,

        title:
          book.title,

        availableCopies:
          newAvailableCopies,

        status:
          "AVAILABLE",
      },
    };

  } catch (error) {

    await transaction.rollback();

    throw error;
  }
};

module.exports = {
  returnBook,
};