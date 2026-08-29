"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MemberWallet extends Model {}

  MemberWallet.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      memberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },

      fundedByLibrarianId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      fine: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      modelName: "MemberWallet",
      tableName: "member_wallets",
      timestamps: true,
    }
  );

  return MemberWallet;
};