const sequelize = require("../config/db");
const { SuperAdmin, Librarian, Member } = require("../models");

const normalizeEmail = (email) => {
  if (typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
};

const findEmailOwner = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const [superAdmin, librarian, member] = await Promise.all([
    SuperAdmin.findOne({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("email")),
        normalizedEmail
      ),
    }),
    Librarian.findOne({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("email")),
        normalizedEmail
      ),
    }),
    Member.findOne({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("email")),
        normalizedEmail
      ),
    }),
  ]);

  if (superAdmin) {
    return {
      role: "SUPER_ADMIN",
      user: superAdmin,
    };
  }

  if (librarian) {
    return {
      role: "LIBRARIAN",
      user: librarian,
    };
  }

  if (member) {
    return {
      role: "MEMBER",
      user: member,
    };
  }

  return null;
};

const ensureEmailAvailable = async (
  email,
  { currentRole, currentUserId } = {}
) => {
  const existingUser = await findEmailOwner(email);

  if (!existingUser) {
    return;
  }

  const isSameUser =
    currentRole &&
    currentUserId !== undefined &&
    existingUser.role === currentRole &&
    existingUser.user.id === Number(currentUserId);

  if (isSameUser) {
    return;
  }

  const error = new Error("Email is already registered");
  error.statusCode = 409;
  throw error;
};

module.exports = {
  normalizeEmail,
  findEmailOwner,
  ensureEmailAvailable,
};
