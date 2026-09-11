"use strict";

const { Librarian } = require("../../models");
const { redisConnection } = require("../../config/redis");

const deleteLibrarian = async (librarianId) => {
  const librarian = await Librarian.findByPk(librarianId);

  if (!librarian) {
    const error = new Error("Librarian not found");
    error.statusCode = 404;
    throw error;
  }

  await librarian.destroy();

  await redisConnection.del(
    "librarians:all",
    `librarian:${librarianId}`
  );

  return {
    message: "Librarian deleted successfully",
  };
};

module.exports = {
  deleteLibrarian,
};