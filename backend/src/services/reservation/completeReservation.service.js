"use strict";

const { Reservation,} = require("../../models");
const { processReservationQueue } = require("../../queue/reservationQueue");

const createError = (message,statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const completeReservation = async (reservationId) => {
  if (!reservationId) {
    throw createError( "Reservation ID is required", 400);
  }

  const reservation = await Reservation.findByPk(reservationId);

  if (!reservation) {
    throw createError("Reservation not found",404);
  }

  if (reservation.status !== "PENDING" && reservation.status !== "APPROVED") {
    throw createError("Only active reservations can be completed",400);
  }

  return processReservationQueue(reservation.bookId);
};

module.exports = {
  completeReservation,
};