"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Database already contains all required changes.
    //
    // member_wallets:
    // fundedByLibrarianId already exists.
    //
    // rentals:
    // librarianId already exists.
    // rentalAmount already exists.
    // settlementStatus already exists.
    // settledAt already exists.
  },

  async down(queryInterface, Sequelize) {
    // Nothing to rollback because this migration
    // does not make any database changes.
  },
};