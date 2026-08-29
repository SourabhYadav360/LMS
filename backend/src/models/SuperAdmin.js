"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SuperAdmin extends Model {
    static associate(models) {
      SuperAdmin.hasOne(models.SuperAdminWallet, {
        foreignKey: "superAdminId",
        as: "wallet",
      });
    }
  }

  SuperAdmin.init(
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
      modelName: "SuperAdmin",
      tableName: "super_admins",
    }
  );

  return SuperAdmin;
};