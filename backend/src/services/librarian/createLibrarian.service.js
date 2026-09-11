"use strict";

const bcrypt = require("bcryptjs");

const sequelize = require("../../config/db");
const { redisConnection } = require("../../config/redis");

const {SuperAdmin,Librarian,Member,LibrarianWallet,} = require("../../models");

const createLibrarian = async ({
  name,
  email,
  password,
}) => {
  // Normalize email
  const normalizedEmail =email.trim().toLowerCase();

  // Check email in all users
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

  // Email already exists
  if (existingSuperAdmin ||existingLibrarian ||existingMember) {
    const error = new Error(
      "Email is already registered"
    );
       error.statusCode = 409;
        throw error;
  }

  // Hash password
  const hashedPassword =await bcrypt.hash(password, 10);

  // Start transaction
  const transaction = await sequelize.transaction();

  try {
    // Create librarian
    const librarian =await Librarian.create(
        {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          status: "ACTIVE",
        },
        {
          transaction,
        }
      );

    // Create librarian wallet
    await LibrarianWallet.create(
      {
        librarianId: librarian.id,
        balance: 0.0,
      },
      {
        transaction,
      }
    );

    // Commit transaction
    await transaction.commit();

    // Remove password from response
    const result =librarian.toJSON();

    delete result.password;

    await redisConnection.del("librarians:all");

    return result;

  } catch (error) {
    // Rollback if anything fails
    await transaction.rollback();

    throw error;
  }
};

module.exports = {
  createLibrarian,
};