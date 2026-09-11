"use strict";

const {
  getDashboard,
} = require("../services/admin/dashboard.service");

// ======================================================
// ADMIN DASHBOARD
// ======================================================

const getAdminDashboard = async (req, res, next) => {
  try {
    const result = await getDashboard();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getAdminDashboard,
};