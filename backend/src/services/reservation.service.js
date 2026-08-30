"use strict";

const {
  sequelize,
  Sequelize,
  Member,
  Book,
  Rental,
  Reservation,
} = require("../models");

const {
  processReservationQueue,
} = require("../queue/reservationQueue");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// ======================================================
// CONSTANTS
// ======================================================

const RESERVATION_EXPIRY_DAYS = 2;

// ======================================================
// CREATE RESERVATION
// MEMBER
// ======================================================

const createReservation = async ({
  memberId,
  bookId,
}) => {
  if (!bookId) {
    throw createError(
      "Book ID is required",
      400
    );
  }

  const transaction =
    await sequelize.transaction();

  try {
    // --------------------------------------------------
    // 1. MEMBER CHECK
    // --------------------------------------------------

    const member = await Member.findByPk(
      memberId,
      {
        transaction,
      }
    );

    if (!member) {
      throw createError(
        "Member not found",
        404
      );
    }

    if (member.status !== "ACTIVE") {
      throw createError(
        "Member account is inactive",
        403
      );
    }

    // --------------------------------------------------
    // 2. BOOK CHECK
    // --------------------------------------------------

    const book = await Book.findByPk(
      bookId,
      {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }
    );

    if (!book) {
      throw createError(
        "Book not found",
        404
      );
    }

    // --------------------------------------------------
    // 3. CHECK EXISTING RESERVATION
    // --------------------------------------------------

    // Reservation ko duplicate-rent rule se block nahi karna.
    // Member same book ko reserve kar sakta hai even agar usne usko pehle rent kiya ho,
    // jab book unavailable ho aur FIFO queue apply ho.

    // --------------------------------------------------
    // 4. CHECK EXISTING RESERVATION
    // --------------------------------------------------

    const existingReservation =
      await Reservation.findOne({
        where: {
          memberId,
          bookId,

          status: {
            [Sequelize.Op.in]: [
              "PENDING",
              "APPROVED",
            ],
          },
        },

        transaction,
      });

    if (existingReservation) {
      throw createError(
        "You already have an active reservation for this book",
        400
      );
    }

    // --------------------------------------------------
    // 5. CREATE EXPIRY DATE
    // --------------------------------------------------

    const reservedAt = new Date();

    const expiresAt = new Date(
      reservedAt
    );

    expiresAt.setDate(
      expiresAt.getDate() +
        RESERVATION_EXPIRY_DAYS
    );

    // --------------------------------------------------
    // 6. CREATE RESERVATION
    // --------------------------------------------------

    const reservation =
      await Reservation.create(
        {
          memberId,
          bookId,

          reservedAt,
          expiresAt,

          status: "PENDING",
        },
        {
          transaction,
        }
      );

    await transaction.commit();

    try {
      await processReservationQueue(bookId);
    } catch (queueError) {
      console.error(
        "Reservation queue processing failed:",
        queueError
      );
    }

    return reservation;
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
};

// ======================================================
// GET MY RESERVATIONS
// MEMBER
// ======================================================

const getMyReservations = async (
  memberId
) => {
  const reservations =
    await Reservation.findAll({
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
            "status",
            "availableCopies",
          ],
        },
      ],

      order: [
        ["createdAt", "ASC"],
      ],
    });

  return reservations;
};

// ======================================================
// GET SINGLE RESERVATION
// MEMBER
// ======================================================

const getReservationById = async ({
  memberId,
  reservationId,
}) => {
  const reservation =
    await Reservation.findOne({
      where: {
        id: reservationId,
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
            "status",
            "availableCopies",
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
    });

  if (!reservation) {
    throw createError(
      "Reservation not found",
      404
    );
  }

  return reservation;
};

// ======================================================
// CANCEL RESERVATION
// MEMBER
// ======================================================

const cancelReservation = async ({
  memberId,
  reservationId,
  reason,
}) => {
  const reservation =
    await Reservation.findOne({
      where: {
        id: reservationId,
        memberId,
      },
    });

  if (!reservation) {
    throw createError(
      "Reservation not found",
      404
    );
  }

  // Only active reservations
  // can be cancelled.

  if (
    !["PENDING", "APPROVED"].includes(
      reservation.status
    )
  ) {
    throw createError(
      `Reservation cannot be cancelled because it is ${reservation.status}`,
      400
    );
  }

  await reservation.update({
    status: "CANCELLED",

    cancelledAt: new Date(),

    cancellationReason:
      reason || null,
  });

  return reservation;
};

// ======================================================
// GET ALL RESERVATIONS
// SUPER ADMIN + LIBRARIAN
// ======================================================

const getAllReservations =
  async () => {
    const reservations =
      await Reservation.findAll({
        include: [
          {
            model: Member,
            as: "member",

            attributes: [
              "id",
              "name",
              "email",
            ],
          },

          {
            model: Book,
            as: "book",

            attributes: [
              "id",
              "title",
              "author",
              "isbn",
              "status",
              "availableCopies",
            ],
          },
        ],

        order: [
          ["createdAt", "ASC"],
        ],
      });

    return reservations;
  };

// ======================================================
// APPROVE RESERVATION
// SUPER ADMIN + LIBRARIAN
// ======================================================

const approveReservation = async (
  reservationId
) => {
  const transaction =
    await sequelize.transaction();

  try {
    // --------------------------------------------------
    // 1. RESERVATION + LOCK
    // --------------------------------------------------

    const reservation =
      await Reservation.findByPk(
        reservationId,
        {
          transaction,

          lock: transaction.LOCK.UPDATE,
        }
      );

    if (!reservation) {
      throw createError(
        "Reservation not found",
        404
      );
    }

    // --------------------------------------------------
    // 2. STATUS CHECK
    // --------------------------------------------------

    if (reservation.status !== "PENDING") {
      throw createError(
        "Only pending reservations can be approved",
        400
      );
    }

    // --------------------------------------------------
    // 3. EXPIRY CHECK
    // --------------------------------------------------

    if (
      reservation.expiresAt &&
      new Date() >
        new Date(
          reservation.expiresAt
        )
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

      throw createError(
        "Reservation has expired",
        400
      );
    }

    // --------------------------------------------------
    // 4. BOOK + LOCK
    // --------------------------------------------------

    const book = await Book.findByPk(
      reservation.bookId,
      {
        transaction,

        lock: transaction.LOCK.UPDATE,
      }
    );

    if (!book) {
      throw createError(
        "Book not found",
        404
      );
    }

    // --------------------------------------------------
    // 5. BOOK AVAILABILITY
    // --------------------------------------------------

    if (
      book.availableCopies <= 0 ||
      book.status === "UNAVAILABLE"
    ) {
      throw createError(
        "Book is currently unavailable",
        400
      );
    }

    // --------------------------------------------------
    // 6. APPROVE
    // --------------------------------------------------

    await reservation.update(
      {
        status: "APPROVED",

        approvedAt: new Date(),
      },
      {
        transaction,
      }
    );

    await transaction.commit();

    return reservation;
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
};

// ======================================================
// REJECT RESERVATION
// SUPER ADMIN + LIBRARIAN
// ======================================================

const rejectReservation = async ({
  reservationId,
  reason,
}) => {
  const reservation =
    await Reservation.findByPk(
      reservationId
    );

  if (!reservation) {
    throw createError(
      "Reservation not found",
      404
    );
  }

  if (reservation.status !== "PENDING") {
    throw createError(
      "Only pending reservations can be rejected",
      400
    );
  }

  await reservation.update({
    status: "REJECTED",

    rejectedAt: new Date(),

    rejectionReason:
      reason || null,
  });

  return reservation;
};

// ======================================================
// COMPLETE RESERVATION
// SUPER ADMIN + LIBRARIAN
// ======================================================

const completeReservation = async (
  reservationId
) => {
  const transaction =
    await sequelize.transaction();

  try {
    const reservation =
      await Reservation.findByPk(
        reservationId,
        {
          transaction,

          lock: transaction.LOCK.UPDATE,
        }
      );

    if (!reservation) {
      throw createError(
        "Reservation not found",
        404
      );
    }

    if (reservation.status !== "APPROVED") {
      throw createError(
        "Only approved reservations can be completed",
        400
      );
    }

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

    return reservation;
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
};

// ======================================================
// EXPIRE RESERVATIONS
// BACKGROUND JOB / QUEUE
// ======================================================

const expireReservations = async () => {
  const now = new Date();

  const [updatedCount] =
    await Reservation.update(
      {
        status: "EXPIRED",
      },

      {
        where: {
          status: {
            [Sequelize.Op.in]: [
              "PENDING",
              "APPROVED",
            ],
          },

          expiresAt: {
            [Sequelize.Op.lt]: now,
          },
        },
      }
    );

  return updatedCount;
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  getAllReservations,
  approveReservation,
  rejectReservation,
  completeReservation,
  expireReservations,
};