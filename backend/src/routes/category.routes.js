"use strict";

const express = require("express");

const categoryController = require("../controllers/category.controller");

const authenticate = require("../middlewares/auth.middleware");

const router = express.Router();

// ======================================================
// AUTHENTICATION
// ======================================================

// Category ke saare routes ke liye login required
router.use(authenticate);

// ======================================================
// CATEGORY PERMISSION MIDDLEWARE
// ======================================================

const categoryPermission = (permission) => {
  return (req, res, next) => {
    // --------------------------------------------------
    // USER CHECK
    // --------------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // --------------------------------------------------
    // SUPER ADMIN
    // --------------------------------------------------

    // Super Admin ko category par full access
    if (req.user.role === "SUPER_ADMIN") {
      return next();
    }

    // --------------------------------------------------
    // LIBRARIAN
    // --------------------------------------------------

    if (req.user.role !== "LIBRARIAN") {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    // --------------------------------------------------
    // PERMISSION CHECK
    // --------------------------------------------------

    if (req.user[permission] !== true) {
      return res.status(403).json({
        success: false,
        message:
          `You do not have ${permission} permission`,
      });
    }

    next();
  };
};

// ======================================================
// GET ALL CATEGORIES
// ======================================================

// GET /api/categories

router.get(
  "/",
  categoryPermission("categoryView"),
  categoryController.getCategories
);

// ======================================================
// GET SINGLE CATEGORY
// ======================================================

// GET /api/categories/:id

router.get(
  "/:id",
  categoryPermission("categoryView"),
  categoryController.getCategoryById
);

// ======================================================
// CREATE CATEGORY
// ======================================================

// POST /api/categories

router.post(
  "/",
  categoryPermission("categoryCreate"),
  categoryController.createCategory
);

// ======================================================
// UPDATE CATEGORY
// ======================================================

// PUT /api/categories/:id

router.put(
  "/:id",
  categoryPermission("categoryUpdate"),
  categoryController.updateCategory
);

// ======================================================
// DELETE CATEGORY
// ======================================================

// DELETE /api/categories/:id

router.delete(
  "/:id",
  categoryPermission("categoryDelete"),
  categoryController.deleteCategory
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;