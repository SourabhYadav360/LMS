"use strict";

const { Op } = require("sequelize");
const { sequelize, Member, Book, Reservation,} = require("../../models");

const {redisConnection,} = require("../../config/redis");

const RESERVATION_EXPIRY_DAYS = 1;

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createReservation = async ({memberId,bookId,}) => {
  if (!memberId) {
    throw createError("Member ID is required", 400);
  }

  if (!bookId) {
    throw createError("Book ID is required", 400);
  }

  const transaction = await sequelize.transaction();

  try {
    const member = await Member.findByPk(memberId, {
      transaction,
    });

    if (!member) {
      throw createError("Member not found", 404);
    }

    if (member.status !== "ACTIVE") {
      throw createError("Member account is inactive", 400);
    }

    const book = await Book.findOne({
      where: {
        id: bookId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!book) {
      throw createError("Book not found", 404);
    }

    const existingReservation = await Reservation.findOne({
      where: {
        memberId,
        bookId,
        status: {
          [Op.in]: [
            "PENDING",
            "APPROVED",
          ],
        },
      },
      transaction,
    });

    if (existingReservation) {
      throw createError("You already have an active reservation for this book",400);
    }

    const reservedAt = new Date();

    const expiresAt = new Date(reservedAt);

    expiresAt.setDate( expiresAt.getDate() + RESERVATION_EXPIRY_DAYS);

    const reservation = await Reservation.create(
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

    // PostgreSQL update ke baad Redis cache invalidate
    await redisConnection.del("reservations:all");

    return reservation;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  createReservation,
};