"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ==================================================
    // RENTALS TABLE
    // ==================================================

    await queryInterface.addColumn(
      "rentals",
      "librarianId",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      "rentals",
      "rentalAmount",
      {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      }
    );

    await queryInterface.addColumn(
      "rentals",
      "settlementStatus",
      {
        type: Sequelize.ENUM(
          "PENDING",
          "SETTLED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      }
    );

    await queryInterface.addColumn(
      "rentals",
      "settledAt",
      {
        type: Sequelize.DATE,
        allowNull: true,
      }
    );

    // ==================================================
    // MEMBER WALLETS TABLE
    // ==================================================

    await queryInterface.addColumn(
      "member_wallets",
      "fundedByLibrarianId",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // ==================================================
    // REMOVE MEMBER WALLET COLUMN
    // ==================================================

    await queryInterface.removeColumn(
      "member_wallets",
      "fundedByLibrarianId"
    );

    // ==================================================
    // REMOVE RENTAL COLUMNS
    // ==================================================

    await queryInterface.removeColumn(
      "rentals",
      "settledAt"
    );

    await queryInterface.removeColumn(
      "rentals",
      "settlementStatus"
    );

    await queryInterface.removeColumn(
      "rentals",
      "rentalAmount"
    );

    await queryInterface.removeColumn(
      "rentals",
      "librarianId"
    );

    // PostgreSQL ENUM cleanup
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_rentals_settlementStatus";'
    );
  },
};