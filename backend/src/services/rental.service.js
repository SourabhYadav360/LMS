"use strict";

const {
  Rental,
  Book,
  Member,
  MemberWallet,
  LibrarianWallet,
  WalletTransaction,
  sequelize,
} = require("../models");

const {
  processReservationQueue,
} = require("../queue/reservationQueue");

// ======================================================
// CONSTANTS
// ======================================================

const RENTAL_AMOUNT = 1;

// Late fine per day
const FINE_PER_DAY = 1;

// ======================================================
// HELPER: CREATE ERROR
// ======================================================

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// ======================================================
// RENT BOOK
// ======================================================

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
    throw createError(
      "Member ID is required",
      400
    );
  }

  if (!bookId) {
    throw createError(
      "Book ID is required",
      400
    );
  }

  if (
    !Number.isInteger(rentalDays) ||
    rentalDays <= 0
  ) {
    throw createError(
      "Days must be a positive integer",
      400
    );
  }

  if (
    !Number.isInteger(rentalQuantity) ||
    rentalQuantity <= 0
  ) {
    throw createError(
      "Quantity must be a positive integer",
      400
    );
  }

  const transaction =
    await sequelize.transaction();

  try {
    // ==================================================
    // 1. CHECK MEMBER
    // ==================================================

    const member =
      await Member.findOne({
        where: {
          id: memberId,
        },
        transaction,
      });

    if (!member) {
      throw createError(
        "Member not found",
        404
      );
    }

    if (
      String(member.status).toUpperCase() !==
      "ACTIVE"
    ) {
      throw createError(
        "Member account is inactive",
        400
      );
    }

    // ==================================================
    // 2. GET BOOK WITH LOCK
    // ==================================================

    const book =
      await Book.findOne({
        where: {
          id: bookId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

    if (!book) {
      throw createError(
        "Book not found",
        404
      );
    }

    // ==================================================
    // 3. CHECK BOOK AVAILABILITY
    // ==================================================

    const availableCopies =
      Number(book.availableCopies);

    if (
      !Number.isFinite(availableCopies) ||
      availableCopies <= 0
    ) {
      throw createError(
        "Book is currently unavailable",
        400
      );
    }

    // ==================================================
    // 3.5. CHECK QUANTITY vs AVAILABLE COPIES
    // ==================================================

    if (
      rentalQuantity >
      availableCopies
    ) {
      throw createError(
        `Only ${availableCopies} copies available. Cannot rent ${rentalQuantity} copies.`,
        400
      );
    }

    // ==================================================
    // 4. CHECK WHETHER MEMBER ALREADY HAS THIS BOOK
    // ==================================================

    const existingRental =
      await Rental.findOne({
        where: {
          memberId,
          bookId,
          status: "ACTIVE",
        },
        transaction,
      });

    if (existingRental) {
      throw createError(
        "You already have this book rented",
        400
      );
    }

    // ==================================================
    // 5. GET MEMBER WALLET WITH LOCK
    // ==================================================

    const memberWallet =
      await MemberWallet.findOne({
        where: {
          memberId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

    if (!memberWallet) {
      throw createError(
        "Member wallet not found",
        404
      );
    }

    // ==================================================
    // 6. CALCULATE TOTAL RENTAL AMOUNT
    // ==================================================

    const totalRentalAmount =
      rentalQuantity *
      rentalDays *
      RENTAL_AMOUNT;

    // ==================================================
    // 7. CHECK BALANCE
    // ==================================================

    const memberBalanceBefore =
      Number(memberWallet.balance);

    if (
      !Number.isFinite(
        memberBalanceBefore
      )
    ) {
      throw createError(
        "Invalid member wallet balance",
        500
      );
    }

    if (
      memberBalanceBefore <
      totalRentalAmount
    ) {
      throw createError(
        `Insufficient wallet balance. ₹${totalRentalAmount} required. Current balance: ₹${memberBalanceBefore}`,
        400
      );
    }

    // ==================================================
    // 8. CALCULATE NEW MEMBER BALANCE
    // ==================================================

    const memberBalanceAfter =
      memberBalanceBefore -
      totalRentalAmount;

    // ==================================================
    // 9. CREATE RENTAL FIRST
    // ==================================================

    const rentedAt = new Date();

    const dueDate = new Date(
      rentedAt.getTime() +
        rentalDays *
          24 *
          60 *
          60 *
          1000
    );

    const rental =
      await Rental.create(
        {
          memberId,

          // Member self-rent kare to null
          librarianId:
            librarianId || null,

          bookId,

          quantity:
            rentalQuantity,

          rentedAt,

          dueDate,

          returnedAt: null,

          rentalAmount:
            totalRentalAmount,

          settlementStatus:
            "SETTLED",

          settledAt:
            rentedAt,

          status: "ACTIVE",
        },
        {
          transaction,
        }
      );

    // ==================================================
    // 10. DEBIT MEMBER WALLET
    // ==================================================

    await memberWallet.update(
      {
        balance:
          memberBalanceAfter,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // 11. MEMBER WALLET TRANSACTION
    // ==================================================

    await WalletTransaction.create(
      {
        walletType: "MEMBER",

        walletId:
          memberWallet.id,

        type: "DEBIT",

        amount:
          totalRentalAmount,

        balanceBefore:
          memberBalanceBefore,

        balanceAfter:
          memberBalanceAfter,

        description:
          `Book rental: ${book.title} (Qty: ${rentalQuantity}, Days: ${rentalDays})`,

        referenceType:
          "RENTAL",

        referenceId:
          rental.id,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // 12. LIBRARIAN WALLET
    //
    // Credit the librarian who funded this member's wallet.
    // This maintains the funding source relationship.
    // ==================================================

    let librarianWallet = null;

    let librarianBalanceBefore =
      null;

    let librarianBalanceAfter =
      null;

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
          lock: transaction.LOCK.UPDATE,
        });

      // Wallet nahi hai to create
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
        Number(
          librarianWallet.balance
        );

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

      // ==================================================
      // LIBRARIAN TRANSACTION
      // ==================================================

      await WalletTransaction.create(
        {
          walletType:
            "LIBRARIAN",

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

          referenceType:
            "RENTAL",

          referenceId:
            rental.id,
        },
        {
          transaction,
        }
      );
    }

    // ==================================================
    // 13. DECREASE BOOK STOCK
    // ==================================================

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
    // 14. COMMIT
    // ==================================================

    await transaction.commit();

    // ==================================================
    // RESPONSE
    // ==================================================

    return {
      rental: {
        id: rental.id,

        memberId:
          rental.memberId,

        librarianId:
          rental.librarianId,

        bookId:
          rental.bookId,

        quantity:
          rental.quantity,

        rentalAmount:
          Number(
            rental.rentalAmount
          ),

        rentedAt:
          rental.rentedAt,

        dueDate:
          rental.dueDate,

        returnedAt:
          rental.returnedAt,

        status:
          rental.status,

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

        librarian: librarianWallet
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

// ======================================================
// GET MY RENTALS
// ======================================================

const getMyRentals = async (
  memberId
) => {
  if (!memberId) {
    throw createError(
      "Member ID is required",
      400
    );
  }

  return await Rental.findAll({
    where: {
      memberId,
    },

    include: [
      {
        model: Book,

        as: "book",

        attributes: [
          "id",
          "title",
          "author",
          "isbn",
        ],
      },
    ],

    order: [
      ["createdAt", "DESC"],
    ],
  });
};

// ======================================================
// GET SINGLE RENTAL
// ======================================================

const getRentalById = async ({
  memberId,
  rentalId,
}) => {
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

  const rental =
    await Rental.findOne({
      where: {
        id: rentalId,
        memberId,
      },

      include: [
        {
          model: Book,

          as: "book",

          attributes: [
            "id",
            "title",
            "author",
            "isbn",
          ],
        },
      ],
    });

  if (!rental) {
    throw createError(
      "Rental not found",
      404
    );
  }

  return rental;
};

// ======================================================
// RETURN BOOK
// ======================================================

const returnBook = async ({
  memberId,
  rentalId,
}) => {
  const transaction =
    await sequelize.transaction();

  try {
    // ==================================================
    // 1. GET RENTAL WITH LOCK
    // ==================================================

    const rental =
      await Rental.findOne({
        where: {
          id: rentalId,
          memberId,
        },

        transaction,

        lock: transaction.LOCK.UPDATE,
      });

    if (!rental) {
      throw createError(
        "Rental not found",
        404
      );
    }

    // ==================================================
    // 2. CHECK ALREADY RETURNED
    // ==================================================

    if (
      rental.status ===
      "RETURNED"
    ) {
      throw createError(
        "Book has already been returned",
        400
      );
    }

    // ==================================================
    // 3. GET BOOK WITH LOCK
    // ==================================================

    const book =
      await Book.findOne({
        where: {
          id: rental.bookId,
        },

        transaction,

        lock: transaction.LOCK.UPDATE,
      });

    if (!book) {
      throw createError(
        "Book not found",
        404
      );
    }

    // ==================================================
    // 4. GET MEMBER WALLET WITH LOCK
    // ==================================================

    const memberWallet =
      await MemberWallet.findOne({
        where: {
          memberId,
        },

        transaction,

        lock: transaction.LOCK.UPDATE,
      });

    if (!memberWallet) {
      throw createError(
        "Member wallet not found",
        404
      );
    }

    // ==================================================
    // 5. RETURN TIME
    // ==================================================

    const returnedAt =
      new Date();

    // ==================================================
    // 6. CALCULATE LATE DAYS
    // ==================================================

    const dueDate =
      new Date(rental.dueDate);

    const timeDifference =
      returnedAt.getTime() -
      dueDate.getTime();

    let lateDays = 0;

    if (
      timeDifference > 0
    ) {
      lateDays = Math.ceil(
        timeDifference /
          (24 *
            60 *
            60 *
            1000)
      );
    }

    // ==================================================
    // 7. CALCULATE FINE
    // ==================================================

    const fineAmount =
      lateDays *
      FINE_PER_DAY;

    // ==================================================
    // 8. MEMBER WALLET FINE UPDATE
    // ==================================================

    const fineBefore =
      Number(
        memberWallet.fine
      );

    const fineAfter =
      fineBefore +
      fineAmount;

    if (fineAmount > 0) {
      await memberWallet.update(
        {
          fine: fineAfter,
        },
        {
          transaction,
        }
      );

      // ==================================================
      // FINE TRANSACTION
      //
      // Fine wallet balance ko directly
      // debit nahi kar raha.
      //
      // Sirf pending fine record ho raha hai.
      // ==================================================

      await WalletTransaction.create(
        {
          walletType:
            "MEMBER",

          walletId:
            memberWallet.id,

          type: "DEBIT",

          amount:
            fineAmount,

          balanceBefore:
            Number(
              memberWallet.balance
            ),

          balanceAfter:
            Number(
              memberWallet.balance
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
    // 9. UPDATE RENTAL
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
    // 10. INCREASE BOOK STOCK
    // ==================================================

    const currentCopies =
      Number(
        book.availableCopies
      );

    const rentalQuantity =
      Number(rental.quantity) || 1;

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
    // 11. COMMIT
    // ==================================================

    await transaction.commit();

    try {
      await processReservationQueue(book.id);
    } catch (queueError) {
      console.error(
        "Reservation queue processing failed after return:",
        queueError
      );
    }

    // ==================================================
    // RESPONSE
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
        id: book.id,

        title: book.title,

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

// ======================================================
// GET ALL RENTALS
// ======================================================

const getAllRentals = async () => {
  return await Rental.findAll({
    include: [
      {
        model: Book,

        as: "book",

        attributes: [
          "id",
          "title",
          "author",
          "isbn",
        ],
      },

      {
        model: Member,

        as: "member",

        attributes: [
          "id",
          "name",
          "email",
        ],
      },
    ],

    order: [
      ["createdAt", "DESC"],
    ],
  });
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  rentBook,
  getMyRentals,
  getRentalById,
  returnBook,
  getAllRentals,
};