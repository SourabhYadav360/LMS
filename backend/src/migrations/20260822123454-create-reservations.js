"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reservations", {
      // ==================================================
      // ID
      // ==================================================

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // ==================================================
      // MEMBER
      // ==================================================

      memberId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "members",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      // ==================================================
      // BOOK
      // ==================================================

      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "books",
          key: "id",
        },

        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      // ==================================================
      // RESERVATION DATE
      // ==================================================

      reservedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP"
        ),
      },

      // ==================================================
      // EXPIRY
      // ==================================================

      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // ==================================================
      // APPROVAL
      // ==================================================

      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // ==================================================
      // REJECTION
      // ==================================================

      rejectedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      rejectionReason: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // ==================================================
      // CANCELLATION
      // ==================================================

      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      cancellationReason: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // ==================================================
      // COMPLETION
      // ==================================================

      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // ==================================================
      // STATUS
      // ==================================================

      status: {
        type: Sequelize.ENUM(
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

      // ==================================================
      // TIMESTAMPS
      // ==================================================

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP"
        ),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP"
        ),
      },
    });

    // ====================================================
    // INDEXES
    // ====================================================

    await queryInterface.addIndex(
      "reservations",
      ["memberId"]
    );

    await queryInterface.addIndex(
      "reservations",
      ["bookId"]
    );

    await queryInterface.addIndex(
      "reservations",
      ["status"]
    );

    await queryInterface.addIndex(
      "reservations",
      ["bookId", "status"]
    );

    await queryInterface.addIndex(
      "reservations",
      ["memberId", "status"]
    );
  },

  // ======================================================
  // ROLLBACK
  // ======================================================

  async down(queryInterface) {
    await queryInterface.dropTable(
      "reservations"
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_reservations_status";'
    );
  },
};