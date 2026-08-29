"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sequelize = require("../config/db");

const {
  SuperAdmin,
  Librarian,
  Member,
  MemberWallet,
} = require("../models");

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

  const [admin, librarian, member] =
    await Promise.all([
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
  // 2. NORMALIZE
  // --------------------------------------------------

  const normalizedName = name.trim();
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
  // 6. GLOBAL EMAIL UNIQUE
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
  // 8. TRANSACTION
  // --------------------------------------------------

  const transaction =
    await sequelize.transaction();

  try {
    // ----------------------------------------------
    // CREATE MEMBER
    // ----------------------------------------------

    const member = await Member.create(
      {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        status: "ACTIVE",
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
    // COMMIT
    // ----------------------------------------------

    await transaction.commit();

    // ----------------------------------------------
    // SAFE RESPONSE
    // ----------------------------------------------

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: "MEMBER",
      status: member.status,
    };
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
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
  // 1. REQUIRED
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

  let user = null;
  let role = null;

  // ==================================================
  // SUPER ADMIN
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
  // LIBRARIAN
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
  // MEMBER
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

  // --------------------------------------------------
  // USER NOT FOUND
  // --------------------------------------------------

  if (!user) {
    throw createError(
      "Invalid email or password",
      401
    );
  }

  // --------------------------------------------------
  // ACCOUNT STATUS
  // --------------------------------------------------

  if (user.status !== "ACTIVE") {
    throw createError(
      "Account is inactive",
      403
    );
  }

  // --------------------------------------------------
  // PASSWORD CHECK
  // --------------------------------------------------

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

  // --------------------------------------------------
  // CREATE JWT
  // --------------------------------------------------

  const token = jwt.sign(
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

  // --------------------------------------------------
  // SAFE USER
  // --------------------------------------------------

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
// GET CURRENT USER
// ======================================================

const getMe = async (
  userId,
  role
) => {
  let user = null;

  // ==================================================
  // FIND USER BASED ON ROLE
  // ==================================================

  if (role === "SUPER_ADMIN") {
    user =
      await SuperAdmin.findByPk(
        userId,
        {
          attributes: {
            exclude: ["password"],
          },
        }
      );
  } else if (role === "LIBRARIAN") {
    user =
      await Librarian.findByPk(
        userId,
        {
          attributes: {
            exclude: ["password"],
          },
        }
      );
  } else if (role === "MEMBER") {
    user =
      await Member.findByPk(
        userId,
        {
          attributes: {
            exclude: ["password"],
          },
        }
      );
  } else {
    throw createError(
      "Invalid user role",
      403
    );
  }

  // ==================================================
  // USER NOT FOUND
  // ==================================================

  if (!user) {
    throw createError(
      "User not found",
      404
    );
  }

  // ==================================================
  // STATUS CHECK
  // ==================================================

  if (user.status !== "ACTIVE") {
    throw createError(
      "Account is inactive",
      403
    );
  }

  // ==================================================
  // BASIC USER DATA
  // ==================================================

  const result = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  // ==================================================
  // LIBRARIAN PERMISSIONS
  // ==================================================

  if (role === "LIBRARIAN") {
    result.permissions = {
      // ----------------------------------------------
      // BOOK
      // ----------------------------------------------

      bookView: user.bookView,
      bookCreate: user.bookCreate,
      bookUpdate: user.bookUpdate,
      bookDelete: user.bookDelete,

      // ----------------------------------------------
      // MEMBER
      // ----------------------------------------------

      memberView: user.memberView,
      memberCreate: user.memberCreate,
      memberUpdate: user.memberUpdate,
      memberDelete: user.memberDelete,

      // ----------------------------------------------
      // CATEGORY
      // ----------------------------------------------

      categoryView:
        user.categoryView,

      categoryCreate:
        user.categoryCreate,

      categoryUpdate:
        user.categoryUpdate,

      categoryDelete:
        user.categoryDelete,

      // ----------------------------------------------
      // WALLET
      // ----------------------------------------------

      walletView:
        user.walletView,

      walletManage:
        user.walletManage,

      // ----------------------------------------------
      // RENTAL
      // ----------------------------------------------

      rentalView:
        user.rentalView,

      rentalCreate:
        user.rentalCreate,

      rentalReturn:
        user.rentalReturn,

      // ----------------------------------------------
      // RESERVATION
      // ----------------------------------------------

      reservationView:
        user.reservationView,

      reservationManage:
        user.reservationManage,

      // ----------------------------------------------
      // DASHBOARD
      // ----------------------------------------------

      dashboardView:
        user.dashboardView,

      // ----------------------------------------------
      // REPORT
      // ----------------------------------------------

      reportView:
        user.reportView,
    };
  }

  // ==================================================
  // RETURN
  // ==================================================

  return result;
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  registerMember,
  login,
  getMe,
};