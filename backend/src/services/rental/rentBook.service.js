"use strict";

const {Rental,Book,Member,MemberWallet,LibrarianWallet,WalletTransaction,sequelize,} = require("../../models");

const {redisConnection,} = require("../../config/redis");

const RENTAL_AMOUNT = 1;

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};


const rentBook = async ({
  memberId,
  bookId,
  librarianId = null,
  days,
  quantity = 1,
}) => {
  const rentalDays = Number(days);
  const rentalQuantity = Number(quantity);

  // ====================================================
  // VALIDATION
  // ====================================================

  if (!memberId) {
    throw createError("Member ID is required",400);
  }

  if (!bookId) {
    throw createError("Book ID is required",400);
  }

  if (!Number.isInteger(rentalDays) || rentalDays <= 0) {
    throw createError("Days must be a positive integer",400);
  }

  if (!Number.isInteger(rentalQuantity) ||rentalQuantity <= 0) {
    throw createError("Quantity must be a positive integer",400);
  }

  const transaction = await sequelize.transaction();

  try {
    const member = await Member.findOne({
      where: {
        id: memberId,
      },
      transaction,
    });

    if (!member) {
      throw createError("Member not found",404);
    }

    if (String(member.status).toUpperCase() !== "ACTIVE" ) {
      throw createError("Member account is inactive",400);
    }

    const book = await Book.findOne({
      where: {
        id: bookId,
      },

      transaction,

      lock: transaction.LOCK.UPDATE,
    });

    if (!book) {
      throw createError("Book not found",404);
    }

    const availableCopies = Number(book.availableCopies);

    if (!Number.isFinite(availableCopies) ||availableCopies <= 0) {
      throw createError("Book is currently unavailable",400);
    }

    if (rentalQuantity > availableCopies) {
      throw createError( `Only ${availableCopies} copies available. Cannot rent ${rentalQuantity} copies.`, 400 );
    }

    const memberWallet = await MemberWallet.findOne({
        where: {
          memberId,
        },

        transaction,

        lock: transaction.LOCK.UPDATE,
      });

    if (!memberWallet) {
      throw createError("Member wallet not found",404);
    }

    const totalRentalAmount =rentalQuantity *rentalDays *RENTAL_AMOUNT;

    const memberBalanceBefore =Number(memberWallet.balance);

    if (!Number.isFinite(memberBalanceBefore)) {
      throw createError("Invalid member wallet balance",500);
    }

    if ( memberBalanceBefore < totalRentalAmount) {
      throw createError(`Insufficient wallet balance. ₹${totalRentalAmount} required. Current balance: ₹${memberBalanceBefore}`,400);
    }

    const memberBalanceAfter =memberBalanceBefore - totalRentalAmount;

    const rentedAt = new Date();

    const dueDate = new Date(rentedAt.getTime() + rentalDays * 24 * 60 * 60 * 1000);

    const rental = await Rental.create(
      {
        memberId,

        librarianId:
          librarianId || null,

        bookId,

        quantity: rentalQuantity,

        rentedAt,

        dueDate,

        returnedAt: null,

        rentalAmount:
          totalRentalAmount,

        settlementStatus: "SETTLED",

        settledAt: rentedAt,

        status: "ACTIVE",
      },
      {
        transaction,
      }
    );

    await memberWallet.update(
      {
        balance: memberBalanceAfter,
      },
      {
        transaction,
      }
    );

    await WalletTransaction.create(
      {
        walletType: "MEMBER",

        walletId: memberWallet.id,

        type: "DEBIT",

        amount: totalRentalAmount,

        balanceBefore:
          memberBalanceBefore,

        balanceAfter:
          memberBalanceAfter,

        description:
          `Book rental: ${book.title} (Qty: ${rentalQuantity}, Days: ${rentalDays})`,

        referenceType: "RENTAL",

        referenceId: rental.id,
      },
      {
        transaction,
      }
    );

    let librarianWallet = null;

    let librarianBalanceBefore = null;

    let librarianBalanceAfter = null;

    const fundingLibrarianId =
      memberWallet.fundedByLibrarianId;

    if (fundingLibrarianId) {
      librarianWallet =
        await LibrarianWallet.findOne({
          where: {
            librarianId:
              fundingLibrarianId,
          },

          transaction,

          lock:
            transaction.LOCK.UPDATE,
        });

      if (!librarianWallet) {
        librarianWallet =
          await LibrarianWallet.create(
            {
              librarianId:
                fundingLibrarianId,

              balance: 0,
            },
            {
              transaction,
            }
          );
      }

      librarianBalanceBefore =
        Number(librarianWallet.balance);

      librarianBalanceAfter =
        librarianBalanceBefore +
        totalRentalAmount;

      await librarianWallet.update(
        {
          balance:
            librarianBalanceAfter,
        },
        {
          transaction,
        }
      );

      await WalletTransaction.create(
        {
          walletType: "LIBRARIAN",

          walletId:
            librarianWallet.id,

          type: "CREDIT",

          amount:
            totalRentalAmount,

          balanceBefore:
            librarianBalanceBefore,

          balanceAfter:
            librarianBalanceAfter,

          description:
            `Rental earning from member ID ${memberId}: ${book.title} (Qty: ${rentalQuantity})`,

          referenceType: "RENTAL",

          referenceId: rental.id,
        },
        {
          transaction,
        }
      );
    }

    const newAvailableCopies =
      availableCopies -
      rentalQuantity;

    await book.update(
      {
        availableCopies:
          newAvailableCopies,

        status:
          newAvailableCopies > 0
            ? "AVAILABLE"
            : "UNAVAILABLE",
      },
      {
        transaction,
      }
    );

    // ==================================================
    // COMMIT
    // ==================================================

    await transaction.commit();

    // ==================================================
    // REDIS CACHE INVALIDATION
    // ==================================================

    await redisConnection.del(
      "rentals:all"
    );

    await redisConnection.del(
      `rentals:member:${memberId}`
    );

    await redisConnection.del("books:all");

    // ==================================================
    // RESPONSE
    // ==================================================

    return {
      rental: {
        id: rental.id,

        memberId: rental.memberId,

        librarianId:
          rental.librarianId,

        bookId: rental.bookId,

        quantity: rental.quantity,

        rentalAmount:
          Number(rental.rentalAmount),

        rentedAt: rental.rentedAt,

        dueDate: rental.dueDate,

        returnedAt:
          rental.returnedAt,

        status: rental.status,

        settlementStatus:
          rental.settlementStatus,

        settledAt:
          rental.settledAt,
      },

      wallet: {
        member: {
          walletId:
            memberWallet.id,

          balanceBefore:
            memberBalanceBefore,

          amount:
            totalRentalAmount,

          balanceAfter:
            memberBalanceAfter,
        },

        librarian:
          librarianWallet
            ? {
                librarianId:
                  fundingLibrarianId,

                walletId:
                  librarianWallet.id,

                balanceBefore:
                  librarianBalanceBefore,

                amount:
                  totalRentalAmount,

                balanceAfter:
                  librarianBalanceAfter,
              }
            : null,
      },

      book: {
        id: book.id,

        title: book.title,

        availableCopies:
          newAvailableCopies,

        status:
          newAvailableCopies > 0
            ? "AVAILABLE"
            : "UNAVAILABLE",
      },
    };
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
};

module.exports = {
  rentBook,
};