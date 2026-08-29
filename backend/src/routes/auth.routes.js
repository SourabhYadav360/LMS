"use strict";

const express = require("express");

const authController = require("../controllers/auth.controller");

const authenticate = require("../middlewares/auth.middleware");

const router = express.Router();

// ======================================================
// MEMBER REGISTER
// ======================================================

router.post(
  "/register",
  authController.registerMember
);

// ======================================================
// SINGLE LOGIN
// ADMIN + LIBRARIAN + MEMBER
// ======================================================

router.post(
  "/login",
  authController.login
);

// ======================================================
// CURRENT USER
// ======================================================

router.get(
  "/me",
  authenticate,
  authController.getMe
);

// ======================================================
// LOGOUT
// ======================================================

router.post(
  "/logout",
  authController.logout
);

module.exports = router;