"use strict";

const express = require("express");

const reservationController = require(
  "../controllers/reservation.controller"
);

const authenticate = require(
  "../middlewares/auth.middleware"
);

const authorize = require(
  "../middlewares/authorize.middleware"
);

const router = express.Router();

// ======================================================
// MEMBER
// CREATE RESERVATION
// ======================================================

router.post(
  "/",
  authenticate,
  authorize("MEMBER"),
  reservationController.createReservation
);

// ======================================================
// MEMBER
// MY RESERVATIONS
// ======================================================

router.get(
  "/my-reservations",
  authenticate,
  authorize("MEMBER"),
  reservationController.getMyReservations
);

// ======================================================
// ADMIN + LIBRARIAN
// ALL RESERVATIONS
// ======================================================

router.get(
  "/",
  authenticate,
  authorize(
    "SUPER_ADMIN",
    "LIBRARIAN"
  ),
  reservationController.getAllReservations
);

// ======================================================
// MEMBER
// SINGLE RESERVATION
// ======================================================

router.get(
  "/:reservationId",
  authenticate,
  authorize("MEMBER"),
  reservationController.getReservationById
);

// ======================================================
// MEMBER
// CANCEL
// ======================================================

router.post(
  "/:reservationId/cancel",
  authenticate,
  authorize("MEMBER"),
  reservationController.cancelReservation
);

// ======================================================
// ADMIN + LIBRARIAN
// APPROVE
// ======================================================

router.post(
  "/:reservationId/approve",
  authenticate,
  authorize(
    "SUPER_ADMIN",
    "LIBRARIAN"
  ),
  reservationController.approveReservation
);

// ======================================================
// ADMIN + LIBRARIAN
// REJECT
// ======================================================

router.post(
  "/:reservationId/reject",
  authenticate,
  authorize(
    "SUPER_ADMIN",
    "LIBRARIAN"
  ),
  reservationController.rejectReservation
);

// ======================================================
// ADMIN + LIBRARIAN
// COMPLETE
// ======================================================

router.post(
  "/:reservationId/complete",
  authenticate,
  authorize(
    "SUPER_ADMIN",
    "LIBRARIAN"
  ),
  reservationController.completeReservation
);

module.exports = router;