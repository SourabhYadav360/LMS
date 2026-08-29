"use strict";

const express = require("express");

const {
  createLibrarian,
  getAllLibrarians,
  getLibrarianById,
  updateLibrarian,
  updateLibrarianPermissions,
  deleteLibrarian,
} = require("../controllers/librarian.controller");

const {
  getDashboard,
} = require("../controllers/librarianDashboard.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const requirePermission = require("../middlewares/permission.middleware");

const router = express.Router();

// =====================================================
// SUPER ADMIN - CREATE LIBRARIAN
// =====================================================

router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN"),
  createLibrarian
);

// =====================================================
// SUPER ADMIN - GET ALL LIBRARIANS
// =====================================================

router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN"),
  getAllLibrarians
);

// =====================================================
// LIBRARIAN DASHBOARD
// IMPORTANT: YE /:id SE PEHLE HONA CHAHIYE
// =====================================================

router.get(
  "/dashboard",
  authenticate,
  authorize("LIBRARIAN"),
  requirePermission("dashboardView"),
  getDashboard
);

// =====================================================
// SUPER ADMIN - GET LIBRARIAN
// =====================================================

router.get(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  getLibrarianById
);

// =====================================================
// SUPER ADMIN - UPDATE LIBRARIAN
// =====================================================

router.put(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  updateLibrarian
);

// =====================================================
// SUPER ADMIN - UPDATE PERMISSIONS
// =====================================================

router.patch(
  "/:id/permissions",
  authenticate,
  authorize("SUPER_ADMIN"),
  updateLibrarianPermissions
);

// =====================================================
// SUPER ADMIN - DELETE LIBRARIAN
// =====================================================

router.delete(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  deleteLibrarian
);

module.exports = router;