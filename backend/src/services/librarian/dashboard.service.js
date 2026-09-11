"use strict";

const {
  Book,
  Member,
  Rental,
  Reservation,
  LibrarianWallet,
} = require("../../models");

const { Op } = require("sequelize");

// GET LIBRARIAN DASHBOARD

const getDashboard = async (librarianId) => {
  const totalBooks = await Book.count();

  const availableBooks = await Book.count({
    where: {
      availableCopies: {
        [Op.gt]: 0,
      },
    },
  });

  const totalMembers = await Member.count();

  const activeRentals = await Rental.count({
    where: {
      status: "ACTIVE",
    },
  });

  const pendingReservations =
    await Reservation.count({
      where: {
        status: "PENDING",
      },
    });

  // LIBRARIAN WALLET
  const librarianWallet =
    await LibrarianWallet.findOne({
      where: {
        librarianId,
      },
      attributes: ["id", "balance"],
    });

  return {
    totalBooks,
    availableBooks,
    totalMembers,
    activeRentals,
    pendingReservations,

    wallet: {
      walletId: librarianWallet?.id || null,
      balance: Number(
        librarianWallet?.balance || 0
      ),
    },
  };
};

module.exports = {
  getDashboard,
};