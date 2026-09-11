"use strict";

const express = require("express");

const {
  rentBook,
  getMyRentals,
  getRentalById,
  returnBook,
  getAllRentals,
} = require("../controllers/rental.controller");

const { authenticate } = require("../middlewares/auth.middleware");
const {
  requirePermission,
} = require("../middlewares/permission.middleware");

const router = express.Router();

// ======================================================
// MEMBER → RENT BOOK
// ======================================================

router.post(
  "/",
  authenticate,
  requirePermission("rentalCreate"),
  rentBook
);

// ======================================================
// MEMBER → GET MY RENTALS
// ======================================================

router.get(
  "/my",
  authenticate,
  requirePermission("rentalView"),
  getMyRentals
);

// ======================================================
// MEMBER → GET SINGLE RENTAL
// ======================================================

router.get(
  "/:rentalId",
  authenticate,
  requirePermission("rentalView"),
  getRentalById
);

// ======================================================
// MEMBER → RETURN BOOK
// ======================================================

router.post(
  "/:rentalId/return",
  authenticate,
  requirePermission("rentalReturn"),
  returnBook
);

// ======================================================
// ADMIN / LIBRARIAN → GET ALL RENTALS
// ======================================================

router.get(
  "/",
  authenticate,
  requirePermission("rentalView"),
  getAllRentals
);

module.exports = router;