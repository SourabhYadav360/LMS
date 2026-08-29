"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Librarian extends Model {
    static associate(models) {
      Librarian.hasOne(models.LibrarianWallet, {
        foreignKey: "librarianId",
        as: "wallet",
      });

      Librarian.hasMany(models.Rental, {
        foreignKey: "librarianId",
        as: "rentals",
      });
    }
  }

  Librarian.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },

      bookView: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      bookCreate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      bookUpdate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      bookDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      memberView: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      memberCreate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      memberUpdate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      memberDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      categoryView: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      categoryCreate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      categoryUpdate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      categoryDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      walletView: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      walletManage: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      rentalView: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      rentalCreate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      rentalReturn: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      reservationView: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      reservationManage: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      dashboardView: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      reportView: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Librarian",
      tableName: "librarians",
    }
  );

  return Librarian;
};