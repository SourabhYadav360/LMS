"use strict";

const express = require("express");

const adminController = require("../controllers/admin.controller");

const authenticate = require("../middlewares/auth.middleware");

const router = express.Router();

// ======================================================
// AUTHENTICATION
// ======================================================

// Har Admin route ke liye login required
router.use(authenticate);

// ======================================================
// SUPER ADMIN CHECK
// ======================================================

const superAdminOnly = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message:
        "Access denied. Super Admin only.",
    });
  }

  next();
};

router.use(superAdminOnly);

// ======================================================
// DASHBOARD
// ======================================================

// GET /api/admin/dashboard

router.get(
  "/dashboard",
  adminController.getDashboard
);

// ======================================================
// LIBRARIANS
// ======================================================

// GET /api/admin/librarians

router.get(
  "/librarians",
  adminController.getLibrarians
);

// ======================================================
// GET SINGLE LIBRARIAN
// ======================================================

// GET /api/admin/librarians/:id

router.get(
  "/librarians/:id",
  adminController.getLibrarianById
);

// ======================================================
// CREATE LIBRARIAN
// ======================================================

// POST /api/admin/librarians

router.post(
  "/librarians",
  adminController.createLibrarian
);

// ======================================================
// UPDATE LIBRARIAN
// ======================================================

// PUT /api/admin/librarians/:id

router.put(
  "/librarians/:id",
  adminController.updateLibrarian
);

// ======================================================
// UPDATE LIBRARIAN PERMISSIONS
// ======================================================

// PATCH /api/admin/librarians/:id/permissions

router.patch(
  "/librarians/:id/permissions",
  adminController.updateLibrarianPermissions
);

// ======================================================
// ACTIVATE LIBRARIAN
// ======================================================

// PATCH /api/admin/librarians/:id/activate

router.patch(
  "/librarians/:id/activate",
  adminController.activateLibrarian
);

// ======================================================
// DEACTIVATE LIBRARIAN
// ======================================================

// PATCH /api/admin/librarians/:id/deactivate

router.patch(
  "/librarians/:id/deactivate",
  adminController.deactivateLibrarian
);

// ======================================================
// MEMBERS
// ======================================================

// GET ALL MEMBERS
// GET /api/admin/members

router.get(
  "/members",
  adminController.getMembers
);

// ACTIVATE MEMBER
// PATCH /api/admin/members/:id/activate

router.patch(
  "/members/:id/activate",
  adminController.activateMember
);

// DEACTIVATE MEMBER
// PATCH /api/admin/members/:id/deactivate

router.patch(
  "/members/:id/deactivate",
  adminController.deactivateMember
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;