"use strict";

const {Reservation,} = require("../../models");
const {redisConnection,} = require("../../config/redis");

const createError = (message,statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const rejectReservation = async ({reservationId,reason,}) => {
  if (!reservationId) {
    throw createError(
      "Reservation ID is required",
      400
    );
  }

  const reservation = await Reservation.findByPk(reservationId);

  if (!reservation) {
    throw createError("Reservation not found",404);}

  if ( reservation.status !== "PENDING") {
    throw createError("Only pending reservations can be rejected",400);
  }

  await reservation.update({
    status: "REJECTED",
    rejectedAt: new Date(),
    rejectionReason:
      reason || null,
  });

  await redisConnection.del("reservations:all");

  return reservation;
};

module.exports = {
  rejectReservation,
};