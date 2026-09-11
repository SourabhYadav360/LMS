"use strict";

const {Rental,Book,} = require("../../models");

const createError = (message,statusCode = 400) => {
  const error = new Error(message);
  error.statusCode =statusCode;
  return error;
};

// ======================================================
// GET SINGLE RENTAL
// ======================================================

const getRentalById = async ({ memberId,rentalId,}) => {
  if (!memberId) {
    throw createError("Member ID is required",400);
  }

  if (!rentalId) {
    throw createError("Rental ID is required",400);
  }

  const rental =await Rental.findOne({
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

module.exports = {
  getRentalById,
};