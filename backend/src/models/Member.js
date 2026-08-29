"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    static associate(models) {
      Member.hasOne(models.MemberWallet, {
        foreignKey: "memberId",
        as: "wallet",
      });

      Member.hasMany(models.Rental, {
        foreignKey: "memberId",
        as: "rentals",
      });

      Member.hasMany(models.Reservation, {
        foreignKey: "memberId",
        as: "reservations",
      });
    }
  }

  Member.init(
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
    },
    {
      sequelize,
      modelName: "Member",
      tableName: "members",
    }
  );

  return Member;
};