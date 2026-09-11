"use strict";

const {Rental,Book,Member,} = require("../../models");

const { redisConnection,} = require("../../config/redis");

// ======================================================
// GET ALL RENTALS
// ======================================================

const getAllRentals = async () => {

  // Check Redis cache
  const cachedRentals = await redisConnection.get("rentals:all");

  if (cachedRentals) {
     console.log("Rentals fetched from Redis");
   return JSON.parse(cachedRentals);
  }

  console.log("Rentals fetched from PostgreSQL");

  const rentals = await Rental.findAll({
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

    order: [
      ["createdAt", "DESC"],
    ],
  });

  // Store result in Redis for 5 minutes
  await redisConnection.set(
    "rentals:all",
    JSON.stringify(rentals),
    "EX",
    300
  );

  return rentals;
};

module.exports = {
  getAllRentals,
};