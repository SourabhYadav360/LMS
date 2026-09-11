"use strict";

const express = require("express");

const {
  getAll,
  getById,
  create,
  update,
  remove,
} = require("../controllers/category.controller");

const { authenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

const router = express.Router();

// ======================================================
// GET ALL CATEGORIES
// ======================================================

router.get(
  "/",
  authenticate,
  requirePermission("categoryView"),
  getAll
);

// ======================================================
// GET CATEGORY BY ID
// ======================================================

router.get(
  "/:categoryId",
  authenticate,
  requirePermission("categoryView"),
  getById
);

// ======================================================
// CREATE CATEGORY
// ======================================================

router.post(
  "/",
  authenticate,
  requirePermission("categoryCreate"),
  create
);

// ======================================================
// UPDATE CATEGORY
// ======================================================

router.put(
  "/:categoryId",
  authenticate,
  requirePermission("categoryUpdate"),
  update
);

// ======================================================
// DELETE CATEGORY
// ======================================================

router.delete(
  "/:categoryId",
  authenticate,
  requirePermission("categoryDelete"),
  remove
);

module.exports = router;