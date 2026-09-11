"use strict";

const bcrypt = require("bcrypt");

const {SuperAdmin,Librarian,Member,MemberWallet,} = require("../../models");

const {getMemberById,} = require("./getMemberById.service");

const {
  redisConnection,
} = require("../../config/redis");

const createMember = async ({name, email, password,}) => {
  if (!name || !email || !password) {
    const error = new Error("Name, email and password are required");
     error.statusCode = 400;
    throw error;
  }

  // NORMALIZE DATA
  const normalizedName = name.trim();
  const normalizedEmail =email.trim().toLowerCase();


  if (normalizedName.length < 2) {
    const error = new Error("Member name must be at least 2 characters");
     error.statusCode = 400;
    throw error;
  }

  // EMAIL VALIDATION
  if (!normalizedEmail.includes("@")) {
    const error = new Error("Please enter a valid email");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters");
    error.statusCode = 400;
    throw error;
  }

  // CHECK EMAIL IN ALL USER TABLES
  const [existingSuperAdmin,existingLibrarian,existingMember,] = await Promise.all([
    SuperAdmin.findOne({
      where: {
        email: normalizedEmail,
      },
    }),

    Librarian.findOne({
      where: {
        email: normalizedEmail,
      },
    }),

    Member.findOne({
      where: {
        email: normalizedEmail,
      },
    }),
  ]);

  if (existingSuperAdmin || existingLibrarian ||existingMember) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  // HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);

  // CREATE MEMBER
  const member = await Member.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    status: "ACTIVE",
    role: "MEMBER",
  });

  // CREATE MEMBER WALLET
  await MemberWallet.create({
    memberId: member.id,
    balance: 0,
  });

  await redisConnection.del("members:all");

  return await getMemberById(member.id);
};

module.exports = {
  createMember,
};