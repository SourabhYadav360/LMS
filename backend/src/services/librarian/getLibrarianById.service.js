"use strict";

const { Librarian } = require("../../models");
const { redisConnection } = require("../../config/redis");

const getLibrarianById = async (librarianId) => {
  const cacheKey = `librarian:${librarianId}`;
  const cachedLibrarian = await redisConnection.get(cacheKey);

  if (cachedLibrarian) {
    console.log("Librarian fetched from Redis");
    return JSON.parse(cachedLibrarian);
  }

  const librarian = await Librarian.findByPk(librarianId, {
    attributes: {
      exclude: ["password"],
    },
  });

  if (!librarian) {
    const error = new Error("Librarian not found");
    error.statusCode = 404;
    throw error;
  }

  const result = librarian.toJSON();

  await redisConnection.set(
    cacheKey,
    JSON.stringify(result),
    "EX",
    300
  );

  return result;
};

module.exports = {
  getLibrarianById,
};