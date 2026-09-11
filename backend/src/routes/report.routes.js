"use strict";

const express = require("express");

const {
  getBooks,
  getRentals,
  getReservations,
  getFines,
  getRevenue,
  getMembers,
} = require("../controllers/report.controller");

const { authenticate } = require("../middlewares/auth.middleware");

const {
  requirePermission,
} = require("../middlewares/permission.middleware");

const router = express.Router();

router.get(
  "/books",
  authenticate,
  requirePermission("reportView"),
  getBooks
);

router.get(
  "/rentals",
  authenticate,
  requirePermission("reportView"),
  getRentals
);

router.get(
  "/reservations",
  authenticate,
  requirePermission("reportView"),
  getReservations
);

router.get(
  "/fines",
  authenticate,
  requirePermission("reportView"),
  getFines
);

router.get(
  "/revenue",
  authenticate,
  requirePermission("reportView"),
  getRevenue
);

router.get(
  "/members",
  authenticate,
  requirePermission("reportView"),
  getMembers
);

module.exports = router;