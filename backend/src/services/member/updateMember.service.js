"use strict";

const {Member,} = require("../../models");

const {getMemberById,} = require("./getMemberById.service");

const {redisConnection,} = require("../../config/redis");

const updateMember = async (
  memberId,
  { name, email, status }
) => {
  const member = await Member.findByPk(memberId);

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (name !== undefined) {
    const normalizedName = name.trim();

    if (normalizedName.length < 2) {
      const error = new Error("Member name must be at least 2 characters");
      error.statusCode = 400;
      throw error;
    }

    updateData.name = normalizedName;
  }

  if (email !== undefined) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes("@")) {
      const error = new Error("Please enter a valid email");
      error.statusCode = 400;
      throw error;
    }

    const existingMember = await Member.findOne({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingMember && existingMember.id !== member.id) {
      const error = new Error("Member with this email already exists");
      error.statusCode = 409;
      throw error;
    }
    updateData.email = normalizedEmail;
  }

  if (status !== undefined) {
    if (!["ACTIVE", "INACTIVE"].includes(status) ) {
      const error = new Error("Invalid member status");
      error.statusCode = 400;
      throw error;
    }
    updateData.status = status;
  }

  await member.update(updateData);

  await redisConnection.del("members:all");

  return await getMemberById(member.id);
};

module.exports = {
  updateMember,
};