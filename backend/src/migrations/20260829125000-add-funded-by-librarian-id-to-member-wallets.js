"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable("member_wallets");

    if (!tableDescription.fundedByLibrarianId) {
      await queryInterface.addColumn(
        "member_wallets",
        "fundedByLibrarianId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "ID of the librarian who first funded this wallet",
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn(
        "member_wallets",
        "fundedByLibrarianId"
      );
    } catch (error) {
      // Column might not exist
    }
  },
};
