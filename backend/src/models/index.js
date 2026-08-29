"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");

const basename = path.basename(__filename);

const env = process.env.NODE_ENV || "development";

const config = require("../config/config.js")[env];

const db = {};

let sequelize;

// ======================================================
// SEQUELIZE CONNECTION
// ======================================================

if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable],
    config
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// ======================================================
// LOAD ALL MODELS
// ======================================================

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(
      path.join(__dirname, file)
    )(
      sequelize,
      Sequelize.DataTypes
    );

    db[model.name] = model;
  });

// ======================================================
// SUPER ADMIN ↔ WALLET
// ======================================================

db.SuperAdmin.hasOne(db.SuperAdminWallet, {
  foreignKey: "superAdminId",
  as: "wallet",
});

db.SuperAdminWallet.belongsTo(db.SuperAdmin, {
  foreignKey: "superAdminId",
  as: "superAdmin",
});

// ======================================================
// LIBRARIAN ↔ WALLET
// ======================================================

db.Librarian.hasOne(db.LibrarianWallet, {
  foreignKey: "librarianId",
  as: "wallet",
});

db.LibrarianWallet.belongsTo(db.Librarian, {
  foreignKey: "librarianId",
  as: "librarian",
});

// ======================================================
// MEMBER ↔ WALLET
// ======================================================

db.Member.hasOne(db.MemberWallet, {
  foreignKey: "memberId",
  as: "wallet",
});

db.MemberWallet.belongsTo(db.Member, {
  foreignKey: "memberId",
  as: "member",
});

// ======================================================
// MEMBER WALLET → LIBRARIAN
// ======================================================

db.MemberWallet.belongsTo(db.Librarian, {
  foreignKey: "fundedByLibrarianId",
  as: "fundedByLibrarian",
});

// ======================================================
// MEMBER WALLET ↔ TRANSACTION
// ======================================================

db.MemberWallet.hasMany(db.WalletTransaction, {
  foreignKey: "walletId",
  constraints: false,
  scope: {
    walletType: "MEMBER",
  },
  as: "transactions",
});

// ======================================================
// LIBRARIAN WALLET ↔ TRANSACTION
// ======================================================

db.LibrarianWallet.hasMany(db.WalletTransaction, {
  foreignKey: "walletId",
  constraints: false,
  scope: {
    walletType: "LIBRARIAN",
  },
  as: "transactions",
});

// ======================================================
// SUPER ADMIN WALLET ↔ TRANSACTION
// ======================================================

db.SuperAdminWallet.hasMany(db.WalletTransaction, {
  foreignKey: "walletId",
  constraints: false,
  scope: {
    walletType: "SUPER_ADMIN",
  },
  as: "transactions",
});

// ======================================================
// CATEGORY ↔ BOOK
// ======================================================

db.Category.hasMany(db.Book, {
  foreignKey: "categoryId",
  as: "books",
});

db.Book.belongsTo(db.Category, {
  foreignKey: "categoryId",
  as: "category",
});

// ======================================================
// MEMBER ↔ RENTAL
// ======================================================

db.Member.hasMany(db.Rental, {
  foreignKey: "memberId",
  as: "rentals",
});

db.Rental.belongsTo(db.Member, {
  foreignKey: "memberId",
  as: "member",
});

// ======================================================
// LIBRARIAN ↔ RENTAL
// ======================================================

db.Librarian.hasMany(db.Rental, {
  foreignKey: "librarianId",
  as: "rentals",
});

db.Rental.belongsTo(db.Librarian, {
  foreignKey: "librarianId",
  as: "librarian",
});

// ======================================================
// BOOK ↔ RENTAL
// ======================================================

db.Book.hasMany(db.Rental, {
  foreignKey: "bookId",
  as: "rentals",
});

db.Rental.belongsTo(db.Book, {
  foreignKey: "bookId",
  as: "book",
});

// ======================================================
// MEMBER ↔ RESERVATION
// ======================================================

db.Member.hasMany(db.Reservation, {
  foreignKey: "memberId",
  as: "reservations",
});

db.Reservation.belongsTo(db.Member, {
  foreignKey: "memberId",
  as: "member",
});

// ======================================================
// BOOK ↔ RESERVATION
// ======================================================

db.Book.hasMany(db.Reservation, {
  foreignKey: "bookId",
  as: "reservations",
});

db.Reservation.belongsTo(db.Book, {
  foreignKey: "bookId",
  as: "book",
});

// ======================================================
// SEQUELIZE EXPORTS
// ======================================================

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;