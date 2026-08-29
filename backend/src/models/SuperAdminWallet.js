"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SuperAdminWallet extends Model {}

  SuperAdminWallet.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      superAdminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },

      balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      modelName: "SuperAdminWallet",
      tableName: "super_admin_wallets",
      timestamps: true,
    }
  );

  return SuperAdminWallet;
};