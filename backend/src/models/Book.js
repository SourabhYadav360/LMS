"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {}

  Book.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      totalCopies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      availableCopies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM(
          "AVAILABLE",
          "UNAVAILABLE"
        ),
        allowNull: false,
        defaultValue: "AVAILABLE",
      },
    },
    {
      sequelize: sequelize, // 👈 important
      modelName: "Book",
      tableName: "books",
      timestamps: true,
    }
  );

  return Book;
};