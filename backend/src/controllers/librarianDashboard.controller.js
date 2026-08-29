"use strict";

const dashboardService = require(
  "../services/librarianDashboard.service"
);

// =====================================================
// GET DASHBOARD
// =====================================================

const getDashboard = async (req, res, next) => {
  try {
    const dashboard =
      await dashboardService.getDashboard();

    return res.status(200).json({
      success: true,
      message: "Dashboard fetched successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};