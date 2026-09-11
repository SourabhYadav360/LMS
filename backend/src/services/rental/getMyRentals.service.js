"use strict";

const {Rental,Book,} = require("../../models");

const {redisConnection,} = require("../../config/redis");

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
 return error;
};

const getMyRentals = async (memberId) => {
  if (!memberId) {
    throw createError("Member ID is required",400);
  }

  // Check Redis cache
  const cacheKey = `rentals:member:${memberId}`;

  const cachedRentals = await redisConnection.get(cacheKey);

  if (cachedRentals) {
   
    return JSON.parse(cachedRentals);
  }

 

  const rentals = await Rental.findAll({
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

  // Store in Redis for 5 minutes
  await redisConnection.set(
    cacheKey,
    JSON.stringify(rentals),
    "EX",
    300
  );

  return rentals;
};

module.exports = {
  getMyRentals,
};