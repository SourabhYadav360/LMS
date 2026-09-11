"use strict";

const {Reservation,Book,Member,} = require("../../models");
const {redisConnection,} = require("../../config/redis");

const getAllReservations =async () => {

  const cachedReservations = await redisConnection.get("reservations:all");

  if (cachedReservations) {
    console.log("Reservations fetched from Redis");
    return JSON.parse(cachedReservations);
  }
  console.log("Reservations fetched from PostgreSQL");
    const reservations =await Reservation.findAll({
        include: [
          {
            model: Member,
            as: "member",
            attributes: [
              "id",
              "name",
              "email",
            ],
          },
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

  await redisConnection.set(
    "reservations:all",
    JSON.stringify(reservations),
    "EX",
    300
  );

    return reservations;
  };

module.exports = {
  getAllReservations,
};