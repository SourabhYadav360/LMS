"use strict";

const bcrypt = require("bcryptjs");
const { Member, SuperAdmin, Librarian } = require("../../models");
const { redisConnection } = require("../../config/redis");

const updateOwnMemberProfile = async (memberId, { name, email, password }) => {
  const member = await Member.findByPk(memberId);

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (name !== undefined) {
    const normalizedName = String(name).trim();
    if (normalizedName.length < 2) {
      const error = new Error("Member name must be at least 2 characters");
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

    if ((existingSuperAdmin) ||(existingLibrarian) ||(existingMember && existingMember.id !== member.id)) {
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

  await member.update(updateData);
  await redisConnection.del("members:all", `member:${member.id}`);

  const result = member.toJSON();
  delete result.password;
  return result;
};

module.exports = {
  updateOwnMemberProfile,
};
