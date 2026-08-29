"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WalletTransaction extends Model {}

  WalletTransaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // ==========================================
      // WALLET TYPE
      // ==========================================

      walletType: {
        type: DataTypes.ENUM(
          "MEMBER",
          "LIBRARIAN",
          "SUPER_ADMIN"
        ),
        allowNull: false,
      },

      // ==========================================
      // WALLET ID
      // ==========================================

      walletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // ==========================================
      // CREDIT / DEBIT
      // ==========================================

      type: {
        type: DataTypes.ENUM(
          "CREDIT",
          "DEBIT"
        ),
        allowNull: false,
      },

      // ==========================================
      // AMOUNT
      // ==========================================

      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      // ==========================================
      // BALANCE SNAPSHOT
      // ==========================================

      balanceBefore: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      balanceAfter: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      // ==========================================
      // DESCRIPTION
      // ==========================================

      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // ==========================================
      // REFERENCE
      // ==========================================

      referenceType: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      referenceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "WalletTransaction",
      tableName: "wallet_transactions",
      timestamps: true,
    }
  );

  return WalletTransaction;
};