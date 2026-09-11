"use strict";

const bcrypt = require("bcryptjs");

const sequelize = require("../../config/db");

const {
  SuperAdmin,
  Librarian,
  Member,
  MemberWallet,
} = require("../../models");

// ======================================================
// ERROR HELPER
// ======================================================

const createError = (message, statusCode) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

// ======================================================
// EMAIL NORMALIZE
// ======================================================

const normalizeEmail = (email) => {
  if (typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
};

// ======================================================
// EMAIL VALIDATION
// ======================================================

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ======================================================
// PASSWORD VALIDATION
// ======================================================

const isValidPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 8
  );
};

// ======================================================
// GLOBAL EMAIL CHECK
// SUPER ADMIN + LIBRARIAN + MEMBER
// ======================================================

const checkEmailAlreadyExists = async (email) => {
  const normalizedEmail =
    normalizeEmail(email);

  const [
    admin,
    librarian,
    member,
  ] = await Promise.all([
    SuperAdmin.findOne({
      where: {
        email: normalizedEmail,
      },
      attributes: ["id"],
    }),

    Librarian.findOne({
      where: {
        email: normalizedEmail,
      },
      attributes: ["id"],
    }),

    Member.findOne({
      where: {
        email: normalizedEmail,
      },
      attributes: ["id"],
    }),
  ]);

  // --------------------------------------------------
  // EMAIL ALREADY EXISTS
  // --------------------------------------------------

  if (admin || librarian || member) {
    throw createError(
      "Email already exists. Please use another email.",
      409
    );
  }
};

// ======================================================
// MEMBER REGISTER
// ======================================================

const registerMember = async ({
  name,
  email,
  password,
}) => {

  // --------------------------------------------------
  // 1. REQUIRED FIELDS
  // --------------------------------------------------

  if (!name || !email || !password) {
    throw createError(
      "Name, email and password are required",
      400
    );
  }

  // --------------------------------------------------
  // 2. NORMALIZE DATA
  // --------------------------------------------------

  const normalizedName =
    name.trim();

  const normalizedEmail =
    normalizeEmail(email);

  // --------------------------------------------------
  // 3. NAME VALIDATION
  // --------------------------------------------------

  if (!normalizedName) {
    throw createError(
      "Name is required",
      400
    );
  }

  // --------------------------------------------------
  // 4. EMAIL VALIDATION
  // --------------------------------------------------

  if (!isValidEmail(normalizedEmail)) {
    throw createError(
      "Invalid email format",
      400
    );
  }

  // --------------------------------------------------
  // 5. PASSWORD VALIDATION
  // --------------------------------------------------

  if (!isValidPassword(password)) {
    throw createError(
      "Password must be at least 8 characters",
      400
    );
  }

  // --------------------------------------------------
  // 6. GLOBAL EMAIL CHECK
  // --------------------------------------------------

  await checkEmailAlreadyExists(
    normalizedEmail
  );

  // --------------------------------------------------
  // 7. HASH PASSWORD
  // --------------------------------------------------

  const hashedPassword =
    await bcrypt.hash(password, 10);

  // --------------------------------------------------
  // 8. START TRANSACTION
  // --------------------------------------------------

  const transaction =
    await sequelize.transaction();

  try {

    // ----------------------------------------------
    // CREATE MEMBER
    // ----------------------------------------------

    const member =
      await Member.create(
        {
          name: normalizedName,
          email: normalizedEmail,
          password: hashedPassword,
          status: "ACTIVE",
          role: "MEMBER",
        },
        {
          transaction,
        }
      );

    // ----------------------------------------------
    // CREATE MEMBER WALLET
    // ----------------------------------------------

    await MemberWallet.create(
      {
        memberId: member.id,
        balance: 0,
      },
      {
        transaction,
      }
    );

    // ----------------------------------------------
    // COMMIT TRANSACTION
    // ----------------------------------------------

    await transaction.commit();

    // ----------------------------------------------
    // SUCCESS RESPONSE
    // ----------------------------------------------

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: "MEMBER",
      status: member.status,
    };

  } catch (error) {

    // ----------------------------------------------
    // ROLLBACK TRANSACTION
    // ----------------------------------------------

    await transaction.rollback();

    // ----------------------------------------------
    // THROW ERROR
    // ----------------------------------------------

    throw error;
  }
};

module.exports = {
  registerMember,
};