"use strict";

const {
  getBookReport,
  getRentalReport,
  getReservationReport,
  getFineReport,
  getRevenueReport,
  getMemberReport,
} = require("../services/reports");

// ======================================================
// BOOK REPORT
// ======================================================

const getBooks = async (req, res, next) => {
  try {
    const result = await getBookReport();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// RENTAL REPORT
// ======================================================

const getRentals = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    const result = await getRentalReport({
      fromDate,
      toDate,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// RESERVATION REPORT
// ======================================================

const getReservations = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    const result = await getReservationReport({
      fromDate,
      toDate,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// FINE REPORT
// ======================================================

const getFines = async (req, res, next) => {
  try {
    const result = await getFineReport();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// REVENUE REPORT
// ======================================================

const getRevenue = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    const result = await getRevenueReport({
      fromDate,
      toDate,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// MEMBER REPORT
// ======================================================

const getMembers = async (req, res, next) => {
  try {
    const result = await getMemberReport();

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
  getBooks,
  getRentals,
  getReservations,
  getFines,
  getRevenue,
  getMembers,
};