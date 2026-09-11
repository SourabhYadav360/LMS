"use strict";

const {
  Librarian,
  Member,
  Book,
  Category,
  Rental,
  Reservation,
  SuperAdminWallet,
  SuperAdmin,
} = require("../../models");

const getDashboard = async () => {
  const [totalLibrarians,totalMembers,totalBooks,totalCategories,totalRentals,totalReservations,superAdmin,] = await Promise.all([
    Librarian.count(),

    Member.count(),

    Book.count(),

    Category.count(),

    Rental.count(),

    Reservation.count(),

    SuperAdmin.findOne({
      attributes: ["id"],
      include: [
        {
          model: SuperAdminWallet,
          as: "wallet",
          attributes: ["balance"],
        },
      ],
    }),
  ]);

  const currentWalletAmount =Number(superAdmin?.wallet?.balance || 0);

  return {
    totalLibrarians,
    totalMembers,
    totalBooks,
    totalCategories,

    totalRentals,
    totalReservations,

    currentWalletAmount,
  };
};

module.exports = {
  getDashboard,
};