"use strict";

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
// GET ME
// ======================================================

const getMe = async (userId, role) => {
  let user = null;

  // ==================================================
  // 1. SUPER ADMIN
  // ==================================================

  if (role === "SUPER_ADMIN") {
    user = await SuperAdmin.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
  }

  // ==================================================
  // 2. LIBRARIAN
  // ==================================================

  else if (role === "LIBRARIAN") {
    user = await Librarian.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
  }

  // ==================================================
  // 3. MEMBER
  // ==================================================

  else if (role === "MEMBER") {
    user = await Member.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
  }

  // ==================================================
  // 4. INVALID ROLE
  // ==================================================

  else {
    throw createError(
      "Invalid user role",
      403
    );
  }

  // ==================================================
  // 5. USER NOT FOUND
  // ==================================================

  if (!user) {
    throw createError(
      "User not found",
      404
    );
  }

  // ==================================================
  // 6. ACCOUNT STATUS
  // ==================================================

  if (user.status !== "ACTIVE") {
    throw createError(
      "Account is inactive",
      403
    );
  }

  // ==================================================
  // 7. BASE RESPONSE
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
  // 8. LIBRARIAN PERMISSIONS
  // ==================================================

  if (role === "LIBRARIAN") {
    result.permissions = {
      bookView: Boolean(user.bookView),
      bookCreate: Boolean(user.bookCreate),
      bookUpdate: Boolean(user.bookUpdate),
      bookDelete: Boolean(user.bookDelete),

      memberView: Boolean(user.memberView),
      memberCreate: Boolean(user.memberCreate),
      memberUpdate: Boolean(user.memberUpdate),
      memberDelete: Boolean(user.memberDelete),

      categoryView: Boolean(user.categoryView),
      categoryCreate: Boolean(user.categoryCreate),
      categoryUpdate: Boolean(user.categoryUpdate),
      categoryDelete: Boolean(user.categoryDelete),

      walletView: Boolean(user.walletView),
      walletManage: Boolean(user.walletManage),

      rentalView: Boolean(user.rentalView),
      rentalCreate: Boolean(user.rentalCreate),
      rentalReturn: Boolean(user.rentalReturn),

      reservationView: Boolean(user.reservationView),
      reservationManage: Boolean(user.reservationManage),

      dashboardView: Boolean(user.dashboardView),
      reportView: Boolean(user.reportView),
    };
  }

  // ==================================================
  // 9. RETURN
  // ==================================================

  return result;
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getMe,
};