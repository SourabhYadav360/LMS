"use strict";

const bcrypt = require("bcryptjs");

const { Librarian } = require("../../models");
const { redisConnection } = require("../../config/redis");

const updateLibrarian = async (librarianId, data) => {
  const librarian = await Librarian.findByPk(librarianId);

  if (!librarian) {
    const error = new Error("Librarian not found");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.email !== undefined) {
    updateData.email = data.email;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.password !== undefined) {
    updateData.password = await bcrypt.hash(
      data.password,
      10
    );
  }

  await librarian.update(updateData);

  const result = librarian.toJSON();

  delete result.password;

  await redisConnection.del(
    "librarians:all",
    `librarian:${librarianId}`
  );

  return result;
};

module.exports = {
  updateLibrarian,
};