"use strict";

const { Librarian } = require("../../models");
const { redisConnection } = require("../../config/redis");

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

const updateLibrarianPermissions = async (
  librarianId,
  permissions
) => {
  const librarian = await Librarian.findByPk(librarianId);

  if (!librarian) {
    const error = new Error("Librarian not found");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  for (const permission of ALLOWED_PERMISSIONS) {
    if (permissions[permission] !== undefined) {
      updateData[permission] = Boolean(
        permissions[permission]
      );
    }
  }

  if (updateData.bookCreate || updateData.bookUpdate || updateData.bookDelete) {
    updateData.bookView = true;
  }

  if (updateData.memberCreate || updateData.memberUpdate || updateData.memberDelete || updateData.walletManage) {
    updateData.memberView = true;
  }

  if (updateData.categoryCreate || updateData.categoryUpdate || updateData.categoryDelete) {
    updateData.categoryView = true;
  }

  await librarian.update(updateData);

  const result = librarian.toJSON();

  delete result.password;

  await redisConnection.del(
    "librarians:all",
    `librarian:${librarianId}`
  );

  return result;
};

module.exports = {
  updateLibrarianPermissions,
};