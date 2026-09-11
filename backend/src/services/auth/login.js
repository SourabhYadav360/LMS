"use strict";

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const {
  SuperAdmin,
  Librarian,
  Member,
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
// LOGIN
// SUPER ADMIN + LIBRARIAN + MEMBER
// ======================================================

const login = async ({
  email,
  password,
}) => {

  // --------------------------------------------------
  // 1. REQUIRED FIELDS
  // --------------------------------------------------

  if (!email || !password) {
    throw createError(
      "Email and password are required",
      400
    );
  }

  // --------------------------------------------------
  // 2. NORMALIZE EMAIL
  // --------------------------------------------------

  const normalizedEmail =
    normalizeEmail(email);

  // --------------------------------------------------
  // 3. EMAIL VALIDATION
  // --------------------------------------------------

  if (!isValidEmail(normalizedEmail)) {
    throw createError(
      "Invalid email format",
      400
    );
  }

  // --------------------------------------------------
  // USER VARIABLES
  // --------------------------------------------------

  let user = null;

  let role = null;

  // ==================================================
  // 4. SUPER ADMIN
  // ==================================================

  const admin =
    await SuperAdmin.findOne({
      where: {
        email: normalizedEmail,
      },
    });

  if (admin) {
    user = admin;

    role = "SUPER_ADMIN";
  }

  // ==================================================
  // 5. LIBRARIAN
  // ==================================================

  if (!user) {

    const librarian =
      await Librarian.findOne({
        where: {
          email: normalizedEmail,
        },
      });

    if (librarian) {
      user = librarian;

      role = "LIBRARIAN";
    }
  }

  // ==================================================
  // 6. MEMBER
  // ==================================================

  if (!user) {

    const member =
      await Member.findOne({
        where: {
          email: normalizedEmail,
        },
      });

    if (member) {
      user = member;

      role = "MEMBER";
    }
  }

  // ==================================================
  // 7. USER NOT FOUND
  // ==================================================

  if (!user) {
    throw createError(
      "Invalid email or password",
      401
    );
  }

  // ==================================================
  // 8. ACCOUNT STATUS
  // ==================================================

  if (user.status !== "ACTIVE") {
    throw createError(
      "Account is inactive",
      403
    );
  }

  // ==================================================
  // 9. PASSWORD CHECK
  // ==================================================

  const passwordValid =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!passwordValid) {
    throw createError(
      "Invalid email or password",
      401
    );
  }

  // ==================================================
  // 10. CREATE JWT
  // ==================================================

  const token =
    jwt.sign(
      {
        userId: user.id,
        role: role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || "1d",
      }
    );

  // ==================================================
  // 11. SAFE USER RESPONSE
  // ==================================================

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: role,
      status: user.status,
    },

    token,
  };
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  login,
};