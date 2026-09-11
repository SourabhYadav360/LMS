"use strict";

const express = require("express");

const {
  register,
  loginUser,
  getCurrentUser,
} = require("../controllers/auth.controller");

const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

// ======================================================
// REGISTER
// ======================================================

router.post("/register", register);

// ======================================================
// LOGIN
// ======================================================

router.post("/login", loginUser);

// ======================================================
// CURRENT USER
// ======================================================

router.get("/me", authenticate, getCurrentUser);

module.exports = router;