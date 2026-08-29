"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const email = "admin@library.com";

    const [existingAdmin] = await queryInterface.sequelize.query(
      `SELECT id FROM super_admins WHERE email = :email LIMIT 1`,
      {
        replacements: { email },
      }
    );

    // Admin already exists
    if (existingAdmin.length > 0) {
      return;
    }

    const password = await bcrypt.hash("Admin@123", 10);

    await queryInterface.bulkInsert("super_admins", [
      {
        name: "Super Admin",
        email,
        password,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("super_admins", {
      email: "admin@library.com",
    });
  },
};