"use strict";

const express = require("express");

const rentalController = require("../controllers/rental.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const router = express.Router();

// ======================================================
// MEMBER → RENT BOOK
// ======================================================

router.post(
  "/",
  authenticate,
  authorize("MEMBER"),
  rentalController.rentBook
);

// ======================================================
// ADMIN + LIBRARIAN → GET ALL RENTALS
// ======================================================

router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "LIBRARIAN"),
  rentalController.getAllRentals
);

// ======================================================
// MEMBER → GET MY RENTALS
// ======================================================

router.get(
  "/my-rentals",
  authenticate,
  authorize("MEMBER"),
  rentalController.getMyRentals
);

// ======================================================
// MEMBER → GET SINGLE RENTAL
// ======================================================

router.get(
  "/:rentalId",
  authenticate,
  authorize("MEMBER"),
  rentalController.getRentalById
);

// ======================================================
// MEMBER → RETURN BOOK
// ======================================================

router.post(
  "/:rentalId/return",
  authenticate,
  authorize("MEMBER"),
  rentalController.returnBook
);

module.exports = router;