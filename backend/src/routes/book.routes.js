"use strict";

const express = require("express");

const bookController = require("../controllers/book.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const requirePermission = require("../middlewares/permission.middleware");

const router = express.Router();

// ======================================================
// AUTHENTICATION
// ======================================================

router.use(authenticate);

// ======================================================
// GET ALL BOOKS
// ======================================================

router.get(
  "/",
  authorize("SUPER_ADMIN", "LIBRARIAN", "MEMBER"),
  requirePermission("bookView"),
  bookController.getBooks
);

// ======================================================
// GET SINGLE BOOK
// ======================================================

router.get(
  "/:id",
  authorize("SUPER_ADMIN", "LIBRARIAN", "MEMBER"),
  requirePermission("bookView"),
  bookController.getBookById
);

// ======================================================
// CREATE BOOK
// ======================================================

router.post(
  "/",
  authorize("SUPER_ADMIN", "LIBRARIAN"),
  requirePermission("bookCreate"),
  bookController.createBook
);

// ======================================================
// UPDATE BOOK
// ======================================================

router.put(
  "/:id",
  authorize("SUPER_ADMIN", "LIBRARIAN"),
  requirePermission("bookUpdate"),
  bookController.updateBook
);

// ======================================================
// DELETE BOOK
// ======================================================

router.delete(
  "/:id",
  authorize("SUPER_ADMIN", "LIBRARIAN"),
  requirePermission("bookDelete"),
  bookController.deleteBook
);

module.exports = router;