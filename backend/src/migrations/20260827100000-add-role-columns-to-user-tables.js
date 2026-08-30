"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ================================================================
    // ADD ROLE COLUMN TO SUPER_ADMINS TABLE
    // ================================================================

    await queryInterface.addColumn(
      "super_admins",
      "role",
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "SUPER_ADMIN",
      }
    );

    // ================================================================
    // ADD ROLE COLUMN TO LIBRARIANS TABLE
    // ================================================================

    await queryInterface.addColumn(
      "librarians",
      "role",
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "LIBRARIAN",
      }
    );

    // ================================================================
    // ADD ROLE COLUMN TO MEMBERS TABLE
    // ================================================================

    await queryInterface.addColumn(
      "members",
      "role",
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "MEMBER",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // ================================================================
    // REMOVE ROLE COLUMN FROM SUPER_ADMINS TABLE
    // ================================================================

    await queryInterface.removeColumn(
      "super_admins",
      "role"
    );

    // ================================================================
    // REMOVE ROLE COLUMN FROM LIBRARIANS TABLE
    // ================================================================

    await queryInterface.removeColumn(
      "librarians",
      "role"
    );

    // ================================================================
    // REMOVE ROLE COLUMN FROM MEMBERS TABLE
    // ================================================================

    await queryInterface.removeColumn(
      "members",
      "role"
    );
  },
};
