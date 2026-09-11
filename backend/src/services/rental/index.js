"use strict";

const {
  rentBook,
} = require("./rentBook.service");

const {
  returnBook,
} = require("./returnBook.service");

const {
  getMyRentals,
} = require("./getMyRentals.service");

const {
  getRentalById,
} = require("./getRentalById.service");

const {
  getAllRentals,
} = require("./getAllRentals.service");

module.exports = {
  rentBook,
  returnBook,
  getMyRentals,
  getRentalById,
  getAllRentals,
};