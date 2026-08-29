const bcrypt = require("bcryptjs");
const sequelize = require("../config/db");
const {
  ensureEmailAvailable,
} = require("./globalEmail.service");

const {
  Librarian,
  LibrarianWallet,
} = require("../models");

// =====================================================
// AVAILABLE LIBRARIAN PERMISSIONS
// =====================================================

const ALLOWED_PERMISSIONS = [
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

// =====================================================
// CREATE LIBRARIAN
// =====================================================

const createLibrarian = async ({
  name,
  email,
  password,
}) => {
  await ensureEmailAvailable(email);

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  const transaction = await sequelize.transaction();

  try {
    // Create librarian
    // All permissions remain false by default
    const librarian = await Librarian.create(
      {
        name,
        email,
        password: hashedPassword,
        status: "ACTIVE",
      },
      { transaction }
    );

    await LibrarianWallet.create(
      {
        librarianId: librarian.id,
        balance: 0.0,
      },
      { transaction }
    );

    await transaction.commit();

    // Never return password
    const result = librarian.toJSON();

    delete result.password;

    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// =====================================================
// GET ALL LIBRARIANS
// =====================================================

const getAllLibrarians = async () => {
  const librarians = await Librarian.findAll({
    attributes: {
      exclude: ["password"],
    },
    order: [["createdAt", "DESC"]],
  });

  return librarians;
};

// =====================================================
// GET LIBRARIAN BY ID
// =====================================================

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

// =====================================================
// UPDATE LIBRARIAN
// =====================================================

const updateLibrarian = async (
  librarianId,
  data
) => {
  const librarian = await Librarian.findByPk(
    librarianId
  );

  if (!librarian) {
    const error = new Error(
      "Librarian not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.email !== undefined) {
    updateData.email = data.email;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.password !== undefined) {
    updateData.password =
      await bcrypt.hash(data.password, 10);
  }

  await librarian.update(updateData);

  const result = librarian.toJSON();

  delete result.password;

  return result;
};

// =====================================================
// UPDATE LIBRARIAN PERMISSIONS
// =====================================================

const updateLibrarianPermissions = async (
  librarianId,
  permissions
) => {
  const librarian = await Librarian.findByPk(
    librarianId
  );

  if (!librarian) {
    const error = new Error(
      "Librarian not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const updateData = {};

  // Only permissions sent by frontend
  // will be updated.
  for (const permission of ALLOWED_PERMISSIONS) {
    if (
      permissions[permission] !== undefined
    ) {
      updateData[permission] =
        Boolean(permissions[permission]);
    }
  }

  await librarian.update(updateData);

  const result = librarian.toJSON();

  delete result.password;

  return result;
};

// =====================================================
// DELETE LIBRARIAN
// =====================================================

const deleteLibrarian = async (
  librarianId
) => {
  const librarian = await Librarian.findByPk(
    librarianId
  );

  if (!librarian) {
    const error = new Error(
      "Librarian not found"
    );

    error.statusCode = 404;

    throw error;
  }

  await librarian.destroy();

  return {
    message: "Librarian deleted successfully",
  };
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createLibrarian,
  getAllLibrarians,
  getLibrarianById,
  updateLibrarian,
  updateLibrarianPermissions,
  deleteLibrarian,
};