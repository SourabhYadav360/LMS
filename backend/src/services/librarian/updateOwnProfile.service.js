"use strict";

const bcrypt = require("bcryptjs");
const { Librarian, SuperAdmin, Member } = require("../../models");
const { redisConnection } = require("../../config/redis");

const updateOwnLibrarianProfile = async (librarianId, { name, email, password }) => {
  const librarian = await Librarian.findByPk(librarianId);

  if (!librarian) {
    const error = new Error("Librarian not found");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (name !== undefined) {
    const normalizedName = String(name).trim();
    if (normalizedName.length < 2) {
      const error = new Error("Librarian name must be at least 2 characters");
      error.statusCode = 400;
      throw error;
    }
    updateData.name = normalizedName;
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      const error = new Error("Please enter a valid email");
      error.statusCode = 400;
      throw error;
    }

    const [existingSuperAdmin, existingLibrarian, existingMember] = await Promise.all([
      SuperAdmin.findOne({ where: { email: normalizedEmail } }),
      Librarian.findOne({ where: { email: normalizedEmail } }),
      Member.findOne({ where: { email: normalizedEmail } }),
    ]);

    if (
      (existingSuperAdmin) ||
      (existingLibrarian && existingLibrarian.id !== librarian.id) ||
      (existingMember)
    ) {
      const error = new Error("Email is already registered");
      error.statusCode = 409;
      throw error;
    }

    updateData.email = normalizedEmail;
  }

  if (password !== undefined) {
    if (typeof password !== "string" || password.length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.statusCode = 400;
      throw error;
    }
    updateData.password = await bcrypt.hash(password, 10);
  }

  await librarian.update(updateData);
  await redisConnection.del("librarians:all", `librarian:${librarian.id}`);

  const result = librarian.toJSON();
  delete result.password;
  return result;
};

module.exports = {
  updateOwnLibrarianProfile,
};
