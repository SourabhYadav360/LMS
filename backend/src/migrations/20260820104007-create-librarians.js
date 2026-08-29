"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("librarians", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },

      bookView: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      bookCreate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      bookUpdate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      bookDelete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      memberView: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      memberCreate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      memberUpdate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      memberDelete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      categoryView: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      categoryCreate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      categoryUpdate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      categoryDelete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      walletView: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      walletManage: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      rentalView: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      rentalCreate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      rentalReturn: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      reservationView: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      reservationManage: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      dashboardView: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      reportView: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("librarians");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_librarians_status";'
    );
  },
};