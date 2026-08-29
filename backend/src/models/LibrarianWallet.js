"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LibrarianWallet extends Model {}

  LibrarianWallet.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      librarianId: {
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
      modelName: "LibrarianWallet",
      tableName: "librarian_wallets",
      timestamps: true,
    }
  );

  return LibrarianWallet;
};