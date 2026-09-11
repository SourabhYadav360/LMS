"use strict";

const {
  Reservation,
  Book,
} = require("../../models");

const createError = (message,statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getMyReservations = async (
  memberId
) => {
  if (!memberId) {
    throw createError(
      "Member ID is required",
      400
    );
  }

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

module.exports = {
  getMyReservations,
};