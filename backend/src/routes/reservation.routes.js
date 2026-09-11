"use strict";

const express = require("express");

const {
  create,
  getMy,
  getById,
  getAll,
  approve,
  reject,
  cancel,
  complete,
  expire,
} = require("../controllers/reservation.controller");

const { authenticate } = require("../middlewares/auth.middleware");
const {
  requirePermission,
} = require("../middlewares/permission.middleware");

const router = express.Router();

// ======================================================
// CREATE RESERVATION
// ======================================================

router.post(
  "/",
  authenticate,
  requirePermission("reservationCreate"),
  create
);

// ======================================================
// GET MY RESERVATIONS
// ======================================================

router.get(
  "/my",
  authenticate,
  requirePermission("reservationView"),
  getMy
);

// ======================================================
// GET ALL RESERVATIONS
// ======================================================

router.get(
  "/",
  authenticate,
  requirePermission("reservationView"),
  getAll
);

// ======================================================
// APPROVE RESERVATION
// ======================================================

router.put(
  "/:reservationId/approve",
  authenticate,
  requirePermission("reservationManage"),
  approve
);

// ======================================================
// REJECT RESERVATION
// ======================================================

router.put(
  "/:reservationId/reject",
  authenticate,
  requirePermission("reservationManage"),
  reject
);

// ======================================================
// CANCEL RESERVATION
// ======================================================

router.put(
  "/:reservationId/cancel",
  authenticate,
  requirePermission("reservationManage"),
  cancel
);

// ======================================================
// COMPLETE RESERVATION
// ======================================================

router.put(
  "/:reservationId/complete",
  authenticate,
  requirePermission("reservationManage"),
  complete
);

// ======================================================
// EXPIRE RESERVATIONS
// ======================================================

router.put(
  "/expire",
  authenticate,
  requirePermission("reservationManage"),
  expire
);

// ======================================================
// GET RESERVATION BY ID
// ======================================================

router.get(
  "/:reservationId",
  authenticate,
  requirePermission("reservationView"),
  getById
);

module.exports = router;