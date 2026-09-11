"use strict";

const {
  getBookReport,
} = require("./bookReport.service");

const {
  getRentalReport,
} = require("./rentalReport.service");

const {
  getReservationReport,
} = require("./reservationReport.service");

const {
  getFineReport,
} = require("./fineReport.service");

const {
  getRevenueReport,
} = require("./revenueReport.service");

const {
  getMemberReport,
} = require("./memberReport.service");


module.exports = {
  getBookReport,
  getRentalReport,
  getReservationReport,
  getFineReport,
  getRevenueReport,
  getMemberReport,
};