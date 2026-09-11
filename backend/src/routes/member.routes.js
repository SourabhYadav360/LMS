"use strict";

const express = require("express");

const {
  getDashboard,
  getAll,
  getById,
  create,
  update,
  updateOwnProfile,
  remove,
} = require("../controllers/member.controller");

const { authenticate } = require("../middlewares/auth.middleware");
const {
  requirePermission,
} = require("../middlewares/permission.middleware");

const router = express.Router();

// ======================================================
// MEMBER DASHBOARD
// ======================================================

router.get(
  "/dashboard",
  authenticate,
  requirePermission("dashboardView"),
  getDashboard
);

// ======================================================
// GET ALL MEMBERS
// ======================================================

router.get(
  "/",
  authenticate,
  requirePermission("memberView"),
  getAll
);

// ======================================================
// GET MEMBER BY ID
// ======================================================

router.get(
  "/:memberId",
  authenticate,
  requirePermission("memberView"),
  getById
);

// ======================================================
// CREATE MEMBER
// ======================================================

router.post(
  "/",
  authenticate,
  requirePermission("memberCreate"),
  create
);

router.put(
  "/profile",
  authenticate,
  updateOwnProfile
);

// ======================================================
// UPDATE MEMBER
// ======================================================

router.put(
  "/:memberId",
  authenticate,
  requirePermission("memberUpdate"),
  update
);

// ======================================================
// DELETE MEMBER
// ======================================================

router.delete(
  "/:memberId",
  authenticate,
  requirePermission("memberDelete"),
  remove
);

module.exports = router;