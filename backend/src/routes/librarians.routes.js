"use strict";

const express = require("express");

const {
  getLibrarianDashboard,
  create,
  getAll,
  getById,
  update,
  updateOwnProfile,
  updatePermissions,
  remove,
} = require("../controllers/librarian.controller");

const { authenticate } = require("../middlewares/auth.middleware");
const {
  requirePermission,
} = require("../middlewares/permission.middleware");

const router = express.Router();

// ======================================================
// LIBRARIAN DASHBOARD
// ======================================================

router.get(
  "/dashboard",
  authenticate,
  requirePermission("dashboardView"),
  getLibrarianDashboard
);

// ======================================================
// CREATE LIBRARIAN
// ======================================================

router.post(
  "/",
  authenticate,
  requirePermission("dashboardView"),
  create
);

// ======================================================
// GET ALL LIBRARIANS
// ======================================================

router.get(
  "/",
  authenticate,
  requirePermission("dashboardView"),
  getAll
);

router.put(
  "/profile",
  authenticate,
  updateOwnProfile
);

// ======================================================
// GET LIBRARIAN BY ID
// ======================================================

router.get(
  "/:librarianId",
  authenticate,
  requirePermission("dashboardView"),
  getById
);

// ======================================================
// UPDATE LIBRARIAN
// ======================================================

router.put(
  "/:librarianId",
  authenticate,
  requirePermission("dashboardView"),
  update
);

// ======================================================
// UPDATE LIBRARIAN PERMISSIONS
// ======================================================

router.put(
  "/:librarianId/permissions",
  authenticate,
  requirePermission("dashboardView"),
  updatePermissions
);

// ======================================================
// DELETE LIBRARIAN
// ======================================================

router.delete(
  "/:librarianId",
  authenticate,
  requirePermission("dashboardView"),
  remove
);

module.exports = router;