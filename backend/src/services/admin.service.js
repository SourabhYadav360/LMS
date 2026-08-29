"use strict";

const bcrypt = require("bcryptjs");

const {
  Librarian,
  Member,
  Book,
  Category,
  SuperAdminWallet,
  LibrarianWallet,
  MemberWallet,
} = require("../models");

// ======================================================
// DASHBOARD
// ======================================================

const getDashboard = async () => {
  const [
    totalLibrarians,
    totalMembers,
    totalBooks,
    totalCategories,
  ] = await Promise.all([
    Librarian.count(),
    Member.count(),
    Book.count(),
    Category.count(),
  ]);

  return {
    totalLibrarians,
    totalMembers,
    totalBooks,
    totalCategories,
  };
};

// ======================================================
// LIBRARIAN
// ======================================================

// ======================================================
// GET ALL LIBRARIANS
// ======================================================

const getLibrarians = async () => {
  return await Librarian.findAll({
    attributes: {
      exclude: ["password"],
    },

    order: [["createdAt", "DESC"]],
  });
};

// ======================================================
// GET SINGLE LIBRARIAN
// ======================================================

const getLibrarianById = async (librarianId) => {
  const librarian = await Librarian.findByPk(
    librarianId,
    {
      attributes: {
        exclude: ["password"],
      },
    }
  );

  if (!librarian) {
    const error = new Error(
      "Librarian not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return librarian;
};

// ======================================================
// CREATE LIBRARIAN
// ======================================================

const createLibrarian = async ({
  name,
  email,
  password,
  permissions = {},
}) => {
  // ----------------------------------------------------
  // REQUIRED FIELDS
  // ----------------------------------------------------

  if (!name || !email || !password) {
    const error = new Error(
      "Name, email and password are required"
    );

    error.statusCode = 400;

    throw error;
  }

  const normalizedName = name.trim();

  const normalizedEmail =
    email.trim().toLowerCase();

  // ----------------------------------------------------
  // NAME VALIDATION
  // ----------------------------------------------------

  if (normalizedName.length < 2) {
    const error = new Error(
      "Name must be at least 2 characters"
    );

    error.statusCode = 400;

    throw error;
  }

  // ----------------------------------------------------
  // EMAIL VALIDATION
  // ----------------------------------------------------

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    const error = new Error(
      "Please enter a valid email address"
    );

    error.statusCode = 400;

    throw error;
  }

  // ----------------------------------------------------
  // PASSWORD VALIDATION
  // ----------------------------------------------------

  if (password.length < 8) {
    const error = new Error(
      "Password must be at least 8 characters"
    );

    error.statusCode = 400;

    throw error;
  }

  // ----------------------------------------------------
  // DUPLICATE EMAIL
  // ----------------------------------------------------

  const existingLibrarian =
    await Librarian.findOne({
      where: {
        email: normalizedEmail,
      },
    });

  if (existingLibrarian) {
    const error = new Error(
      "Librarian with this email already exists"
    );

    error.statusCode = 409;

    throw error;
  }

  // ----------------------------------------------------
  // HASH PASSWORD
  // ----------------------------------------------------

  const hashedPassword =
    await bcrypt.hash(password, 10);

  // ----------------------------------------------------
  // CREATE LIBRARIAN
  // ----------------------------------------------------

  const librarian =
    await Librarian.create({
      name: normalizedName,

      email: normalizedEmail,

      password: hashedPassword,

      status: "ACTIVE",

      // BOOK
      bookView: Boolean(
        permissions.bookView
      ),

      bookCreate: Boolean(
        permissions.bookCreate
      ),

      bookUpdate: Boolean(
        permissions.bookUpdate
      ),

      bookDelete: Boolean(
        permissions.bookDelete
      ),

      // MEMBER
      memberView: Boolean(
        permissions.memberView
      ),

      memberCreate: Boolean(
        permissions.memberCreate
      ),

      memberUpdate: Boolean(
        permissions.memberUpdate
      ),

      memberDelete: Boolean(
        permissions.memberDelete
      ),

      // CATEGORY
      categoryView: Boolean(
        permissions.categoryView
      ),

      categoryCreate: Boolean(
        permissions.categoryCreate
      ),

      categoryUpdate: Boolean(
        permissions.categoryUpdate
      ),

      categoryDelete: Boolean(
        permissions.categoryDelete
      ),

      // WALLET
      walletView: Boolean(
        permissions.walletView
      ),

      walletManage: Boolean(
        permissions.walletManage
      ),

      // RENTAL
      rentalView: Boolean(
        permissions.rentalView
      ),

      rentalCreate: Boolean(
        permissions.rentalCreate
      ),

      rentalReturn: Boolean(
        permissions.rentalReturn
      ),

      // RESERVATION
      reservationView: Boolean(
        permissions.reservationView
      ),

      reservationManage: Boolean(
        permissions.reservationManage
      ),

      // DASHBOARD / REPORT
      dashboardView: Boolean(
        permissions.dashboardView
      ),

      reportView: Boolean(
        permissions.reportView
      ),
    });

  // ----------------------------------------------------
  // RESPONSE
  // ----------------------------------------------------

  return {
    id: librarian.id,

    name: librarian.name,

    email: librarian.email,

    status: librarian.status,

    permissions: {
      bookView: librarian.bookView,
      bookCreate: librarian.bookCreate,
      bookUpdate: librarian.bookUpdate,
      bookDelete: librarian.bookDelete,

      memberView: librarian.memberView,
      memberCreate: librarian.memberCreate,
      memberUpdate: librarian.memberUpdate,
      memberDelete: librarian.memberDelete,

      categoryView:
        librarian.categoryView,

      categoryCreate:
        librarian.categoryCreate,

      categoryUpdate:
        librarian.categoryUpdate,

      categoryDelete:
        librarian.categoryDelete,

      walletView:
        librarian.walletView,

      walletManage:
        librarian.walletManage,

      rentalView:
        librarian.rentalView,

      rentalCreate:
        librarian.rentalCreate,

      rentalReturn:
        librarian.rentalReturn,

      reservationView:
        librarian.reservationView,

      reservationManage:
        librarian.reservationManage,

      dashboardView:
        librarian.dashboardView,

      reportView:
        librarian.reportView,
    },

    createdAt: librarian.createdAt,

    updatedAt: librarian.updatedAt,
  };
};

// ======================================================
// UPDATE LIBRARIAN
// ======================================================

const updateLibrarian = async (
  librarianId,
  data
) => {
  const librarian =
    await Librarian.findByPk(librarianId);

  if (!librarian) {
    const error = new Error(
      "Librarian not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const updateData = {};

  // ----------------------------------------------------
  // NAME
  // ----------------------------------------------------

  if (data.name !== undefined) {
    const name = data.name.trim();

    if (name.length < 2) {
      const error = new Error(
        "Name must be at least 2 characters"
      );

      error.statusCode = 400;

      throw error;
    }

    updateData.name = name;
  }

  // ----------------------------------------------------
  // EMAIL
  // ----------------------------------------------------

  if (data.email !== undefined) {
    const email =
      data.email.trim().toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      const error = new Error(
        "Please enter a valid email address"
      );

      error.statusCode = 400;

      throw error;
    }

    const existing =
      await Librarian.findOne({
        where: {
          email,
        },
      });

    if (
      existing &&
      existing.id !== librarian.id
    ) {
      const error = new Error(
        "Email already exists"
      );

      error.statusCode = 409;

      throw error;
    }

    updateData.email = email;
  }

  // ----------------------------------------------------
  // PASSWORD
  // ----------------------------------------------------

  if (data.password !== undefined) {
    if (data.password.length < 8) {
      const error = new Error(
        "Password must be at least 8 characters"
      );

      error.statusCode = 400;

      throw error;
    }

    updateData.password =
      await bcrypt.hash(
        data.password,
        10
      );
  }

  // ----------------------------------------------------
  // PERMISSIONS
  // ----------------------------------------------------

  const permissionFields = [
    "bookView",
    "bookCreate",
    "bookUpdate",
    "bookDelete",

    "memberView",
    "memberCreate",
    "memberUpdate",
    "memberDelete",

    "categoryView",
    "categoryCreate",
    "categoryUpdate",
    "categoryDelete",

    "walletView",
    "walletManage",

    "rentalView",
    "rentalCreate",
    "rentalReturn",

    "reservationView",
    "reservationManage",

    "dashboardView",
    "reportView",
  ];

  permissionFields.forEach(
    (field) => {
      if (
        data.permissions &&
        data.permissions[field] !==
          undefined
      ) {
        updateData[field] = Boolean(
          data.permissions[field]
        );
      }
    }
  );

  await librarian.update(updateData);

  return getLibrarianById(
    librarian.id
  );
};

// ======================================================
// UPDATE LIBRARIAN PERMISSIONS ONLY
// ======================================================

const updateLibrarianPermissions = async (
  librarianId,
  permissions
) => {
  // ----------------------------------------------------
  // FIND LIBRARIAN
  // ----------------------------------------------------

  const librarian =
    await Librarian.findByPk(
      librarianId
    );

  if (!librarian) {
    const error = new Error(
      "Librarian not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // ----------------------------------------------------
  // ALLOWED PERMISSIONS
  // ----------------------------------------------------

  const permissionFields = [
    "bookView",
    "bookCreate",
    "bookUpdate",
    "bookDelete",

    "memberView",
    "memberCreate",
    "memberUpdate",
    "memberDelete",

    "categoryView",
    "categoryCreate",
    "categoryUpdate",
    "categoryDelete",

    "walletView",
    "walletManage",

    "rentalView",
    "rentalCreate",
    "rentalReturn",

    "reservationView",
    "reservationManage",

    "dashboardView",
    "reportView",
  ];

  const updateData = {};

  // ----------------------------------------------------
  // UPDATE ONLY PROVIDED PERMISSIONS
  // ----------------------------------------------------

  permissionFields.forEach(
    (field) => {
      if (
        permissions &&
        permissions[field] !==
          undefined
      ) {
        updateData[field] = Boolean(
          permissions[field]
        );
      }
    }
  );

  // ----------------------------------------------------
  // UPDATE DATABASE
  // ----------------------------------------------------

  await librarian.update(updateData);

  // ----------------------------------------------------
  // RETURN UPDATED LIBRARIAN
  // ----------------------------------------------------

  return getLibrarianById(
    librarian.id
  );
};

// ======================================================
// ACTIVATE LIBRARIAN
// ======================================================

const activateLibrarian = async (
  librarianId
) => {
  const librarian =
    await Librarian.findByPk(
      librarianId
    );

  if (!librarian) {
    const error = new Error(
      "Librarian not found"
    );

    error.statusCode = 404;

    throw error;
  }

  await librarian.update({
    status: "ACTIVE",
  });

  return {
    id: librarian.id,

    status: librarian.status,
  };
};

// ======================================================
// DEACTIVATE LIBRARIAN
// ======================================================

const deactivateLibrarian = async (
  librarianId
) => {
  const librarian =
    await Librarian.findByPk(
      librarianId
    );

  if (!librarian) {
    const error = new Error(
      "Librarian not found"
    );

    error.statusCode = 404;

    throw error;
  }

  await librarian.update({
    status: "INACTIVE",
  });

  return {
    id: librarian.id,

    status: librarian.status,
  };
};

// ======================================================
// MEMBERS
// ======================================================

// GET ALL MEMBERS
// Super Admin sirf members dekh sakta hai
const getMembers = async () => {
  return await Member.findAll({
    attributes: {
      exclude: ["password"],
    },
    order: [["createdAt", "DESC"]],
  });
};

// ACTIVATE MEMBER
const activateMember = async (memberId) => {
  const member = await Member.findByPk(memberId);

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  await member.update({
    status: "ACTIVE",
  });

  return {
    id: member.id,
    name: member.name,
    email: member.email,
    status: member.status,
  };
};

// DEACTIVATE MEMBER
const deactivateMember = async (memberId) => {
  const member = await Member.findByPk(memberId);

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  await member.update({
    status: "INACTIVE",
  });

  return {
    id: member.id,
    name: member.name,
    email: member.email,
    status: member.status,
  };
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  // Dashboard
  getDashboard,

  // Librarian
  getLibrarians,
  getLibrarianById,
  createLibrarian,
  updateLibrarian,
  updateLibrarianPermissions,
  activateLibrarian,
  deactivateLibrarian,

  // Members
  getMembers,
  activateMember,
  deactivateMember,
};