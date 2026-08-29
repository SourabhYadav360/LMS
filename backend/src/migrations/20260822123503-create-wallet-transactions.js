"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wallet_transactions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      walletType: {
        type: Sequelize.ENUM(
          "MEMBER",
          "LIBRARIAN",
          "SUPER_ADMIN"
        ),
        allowNull: false,
      },

      walletId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      type: {
        type: Sequelize.ENUM(
          "CREDIT",
          "DEBIT"
        ),
        allowNull: false,
      },

      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      balanceBefore: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      balanceAfter: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      referenceType: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      referenceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP"
        ),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.addIndex(
      "wallet_transactions",
      ["walletType", "walletId"]
    );

    await queryInterface.addIndex(
      "wallet_transactions",
      ["type"]
    );

    await queryInterface.addIndex(
      "wallet_transactions",
      ["createdAt"]
    );

    await queryInterface.addIndex(
      "wallet_transactions",
      ["referenceType", "referenceId"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "wallet_transactions"
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_wallet_transactions_walletType";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_wallet_transactions_type";'
    );
  },
};