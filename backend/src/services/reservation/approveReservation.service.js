"use strict";

const { sequelize, Reservation } = require("../../models");
const { redisConnection } = require("../../config/redis");

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const approveReservation = async (reservationId) => {
  if (!reservationId) {
    throw createError("Reservation ID is required", 400);
  }

  const transaction = await sequelize.transaction();

  try {
    const reservation = await Reservation.findByPk(reservationId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!reservation) {
      throw createError("Reservation not found", 404);
    }

    if (reservation.status !== "PENDING") {
      throw createError("Only pending reservations can be approved", 400);
    }

    if (reservation.expiresAt && new Date(reservation.expiresAt) <= new Date()) {
      throw createError("Expired reservations cannot be approved", 400);
    }

    await reservation.update(
      {
        status: "APPROVED",
        approvedAt: new Date(),
      },
      { transaction }
    );

    await transaction.commit();
    await redisConnection.del("reservations:all");

    return reservation;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  approveReservation,
};