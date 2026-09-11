"use strict";

const {Reservation,} = require("../../models");

const {redisConnection,} = require("../../config/redis");

const createError = (message,statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const cancelReservation = async ({memberId,reservationId,reason,}) => {
  if (!memberId) {
    throw createError("Member ID is required",400);
  }

  if (!reservationId) {
    throw createError("Reservation ID is required",400);
  }

  const reservation =await Reservation.findOne({
      where: {
        id: reservationId,
        memberId,
      },
    });

  if (!reservation) {
    throw createError("Reservation not found",404);
  }

  if (
    reservation.status !== "PENDING" &&
    reservation.status !== "APPROVED"
  ) {
    throw createError(
      "Only pending or approved reservations can be cancelled",
      400
    );
  }

  await reservation.update({
    status: "CANCELLED",
    cancelledAt: new Date(),
    cancellationReason:
      reason || null,
  });

  await redisConnection.del("reservations:all");

  return reservation;
};

module.exports = {
  cancelReservation,
};