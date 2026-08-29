"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {}

  Reservation.init(
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
      },

      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      reservedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      rejectedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      rejectionReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      cancellationReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "APPROVED",
          "REJECTED",
          "CANCELLED",
          "COMPLETED",
          "EXPIRED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },
    },
    {
      sequelize,
      modelName: "Reservation",
      tableName: "reservations",
      timestamps: true,
    }
  );

  return Reservation;
};