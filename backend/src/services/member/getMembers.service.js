"use strict";

const {Member,MemberWallet,Rental,Reservation,} = require("../../models");

const {redisConnection,} = require("../../config/redis");

const getMembers = async () => {

  const cachedMembers = await redisConnection.get("members:all");

  if (cachedMembers) {
    console.log("Members fetched from Redis");
    return JSON.parse(cachedMembers);
  }
 console.log("Members fetched from PostgreSQL");

  // FETCH FROM DATABASE
  const members = await Member.findAll({
    attributes: {
      exclude: ["password"],
    },

    include: [
      {
        model: MemberWallet,
        as: "wallet",
      },
      {
        model: Rental,
        as: "rentals",
      },
      {
        model: Reservation,
        as: "reservations",
      },
    ],

    order: [["createdAt", "DESC"]],
  });

  // SAVE IN REDIS
  await redisConnection.set(
    "members:all",
    JSON.stringify(members),
    "EX",
    300
  );

  return members;
};

module.exports = {
  getMembers,
};