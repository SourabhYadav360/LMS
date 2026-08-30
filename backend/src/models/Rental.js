"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Rental extends Model {}

  Rental.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // ==========================================
      // MEMBER
      // ==========================================

      memberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // ==========================================
      // LIBRARIAN
      // ==========================================

      librarianId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // ==========================================
      // BOOK
      // ==========================================

      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // ==========================================
      // RENTAL TIME
      // ==========================================

      rentedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      returnedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // ==========================================
      // RENTAL AMOUNT
      // ==========================================

      rentalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      // ==========================================
      // QUANTITY
      // ==========================================

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      // ==========================================
      // SETTLEMENT
      // ==========================================

      settlementStatus: {
        type: DataTypes.ENUM(
          "PENDING",
          "SETTLED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },

      settledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // ==========================================
      // RENTAL STATUS
      // ==========================================

      status: {
        type: DataTypes.ENUM(
          "ACTIVE",
          "RETURNED",
          "OVERDUE"
        ),
        allowNull: false,
        defaultValue: "ACTIVE",
      },
    },
    {
      sequelize,
      modelName: "Rental",
      tableName: "rentals",
      timestamps: true,
    }
  );

  return Rental;
};