"use strict";

const express = require("express");

const { getAdminDashboard } = require("../controllers/admin.controller");

const { authenticate } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  requirePermission("dashboardView"),
  getAdminDashboard
);

module.exports = router;