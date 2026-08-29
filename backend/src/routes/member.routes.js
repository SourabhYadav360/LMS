"use strict";

const express = require("express");

const memberController = require("../controllers/member.controller");

const authenticate = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/authorize.middleware");

const requirePermission = require("../middlewares/permission.middleware");

const router = express.Router();

// ======================================================
// AUTHENTICATION
// ======================================================

router.use(authenticate);

// ======================================================
// GET ALL MEMBERS
// ======================================================

router.get(
  "/",

  authorize(
    "SUPER_ADMIN",
    "LIBRARIAN"
  ),

  requirePermission("memberView"),

  memberController.getMembers
);

// ======================================================
// GET MEMBER BY ID
// ======================================================

router.get(
  "/:id",

  authorize(
    "SUPER_ADMIN",
    "LIBRARIAN"
  ),

  requirePermission("memberView"),

  memberController.getMemberById
);

// ======================================================
// UPDATE MEMBER
// ======================================================

router.put(
  "/:id",

  authorize(
    "SUPER_ADMIN",
    "LIBRARIAN"
  ),

  requirePermission("memberUpdate"),

  memberController.updateMember
);

// ======================================================
// DELETE MEMBER
// ======================================================

router.delete(
  "/:id",

  authorize(
    "SUPER_ADMIN",
    "LIBRARIAN"
  ),

  requirePermission("memberDelete"),

  memberController.deleteMember
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;