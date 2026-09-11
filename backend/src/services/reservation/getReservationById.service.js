"use strict";

const {
  Reservation,
  Book,
  Member,
} = require("../../models");

const createError = (
  message,
  statusCode = 400
) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getReservationById = async ({
  memberId,
  reservationId,
}) => {
  if (!memberId) {
    throw createError(
      "Member ID is required",
      400
    );
  }

  if (!reservationId) {
    throw createError(
      "Reservation ID is required",
      400
    );
  }

  const reservation =await Reservation.findOne({
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

module.exports = {
  getReservationById,
};