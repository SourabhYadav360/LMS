"use strict";

const {
  Book,
  Member,
  Rental,
  Reservation,
} = require("../models");

const { Op } = require("sequelize");

// =====================================================
// GET LIBRARIAN DASHBOARD
// =====================================================

const getDashboard = async () => {
  // ---------------------------------------------
  // TOTAL BOOKS
  // ---------------------------------------------

  const totalBooks = await Book.count();

  // ---------------------------------------------
  // AVAILABLE BOOKS
  // ---------------------------------------------

  const availableBooks = await Book.count({
    where: {
      availableCopies: {
        [Op.gt]: 0,
      },
    },
  });

  // ---------------------------------------------
  // TOTAL MEMBERS
  // ---------------------------------------------

  const totalMembers = await Member.count();

  // ---------------------------------------------
  // ACTIVE RENTALS
  // ---------------------------------------------

  const activeRentals = await Rental.count({
    where: {
      status: "ACTIVE",
    },
  });

  // ---------------------------------------------
  // PENDING RESERVATIONS
  // ---------------------------------------------

  const pendingReservations =
    await Reservation.count({
      where: {
        status: "PENDING",
      },
    });

  // ---------------------------------------------
  // RESPONSE
  // ---------------------------------------------

  return {
    totalBooks,
    availableBooks,
    totalMembers,
    activeRentals,
    pendingReservations,
  };
};

module.exports = {
  getDashboard,
};