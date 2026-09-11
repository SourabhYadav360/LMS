"use strict";

const express = require("express");

const {
  getAll,
  getById,
  create,
  update,
  remove,
} = require("../controllers/book.controller");

const { authenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

const router = express.Router();

// ======================================================
// GET ALL BOOKS
// ======================================================

router.get(
  "/",
  authenticate,
  requirePermission("bookView"),
  getAll
);

// ======================================================
// GET BOOK BY ID
// ======================================================

router.get(
  "/:bookId",
  authenticate,
  requirePermission("bookView"),
  getById
);

// ======================================================
// CREATE BOOK
// ======================================================

router.post(
  "/",
  authenticate,
  requirePermission("bookCreate"),
  create
);

// ======================================================
// UPDATE BOOK
// ======================================================

router.put(
  "/:bookId",
  authenticate,
  requirePermission("bookUpdate"),
  update
);

// ======================================================
// DELETE BOOK
// ======================================================

router.delete(
  "/:bookId",
  authenticate,
  requirePermission("bookDelete"),
  remove
);

module.exports = router;