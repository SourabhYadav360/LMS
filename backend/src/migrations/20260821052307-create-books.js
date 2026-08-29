"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("books", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      author: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      isbn: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      totalCopies: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      availableCopies: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "categories",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      status: {
        type: Sequelize.ENUM("AVAILABLE", "UNAVAILABLE"),
        allowNull: false,
        defaultValue: "AVAILABLE",
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("books");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_books_status";'
    );
  },
};