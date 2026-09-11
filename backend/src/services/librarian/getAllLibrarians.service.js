"use strict";

const { Librarian } = require("../../models");
const { redisConnection } = require("../../config/redis");

const getAllLibrarians = async () => {
  const cachedLibrarians = await redisConnection.get("librarians:all");

  if (cachedLibrarians) {
    console.log("Librarians fetched from Redis");
    return JSON.parse(cachedLibrarians);
  }

  const librarians = await Librarian.findAll({
    attributes: {
      exclude: ["password"],
    },
    order: [["createdAt", "DESC"]],
  });

  const result = librarians.map((librarian) => librarian.toJSON());

  await redisConnection.set(
    "librarians:all",
    JSON.stringify(result),
    "EX",
    300
  );

  return result;
};

module.exports = {
  getAllLibrarians,
};