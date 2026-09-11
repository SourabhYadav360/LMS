"use strict";

const {
  Rental,
  Member,
  Librarian,
  Book,
} = require("../../models");

const { Op } = require("sequelize");

const getRentalReport = async ({
  fromDate,
  toDate,
} = {}) => {
  const where = {};

  // ==========================================
  // DATE FILTER
  // ==========================================

  if (fromDate || toDate) {
    where.rentedAt = {};

    if (fromDate) {
      where.rentedAt[Op.gte] =
        new Date(fromDate);
    }

    if (toDate) {
      where.rentedAt[Op.lte] =
        new Date(toDate);
    }
  }

  // ==========================================
  // GET RENTALS
  // ==========================================

  const rentals = await Rental.findAll({
    where,

    include: [
      {
        model: Member,
        as: "member",
        attributes: [
          "id",
          "name",
          "email",
        ],
      },

      {
        model: Librarian,
        as: "librarian",
        attributes: [
          "id",
          "name",
          "email",
        ],
        required: false,
      },

      {
        model: Book,
        as: "book",
        attributes: [
          "id",
          "title",
          "author",
          "isbn",
        ],
      },
    ],

    order: [["rentedAt", "DESC"]],
  });

  // ==========================================
  // SUMMARY
  // ==========================================

  const totalRentals =
    rentals.length;

  const activeRentals =
    rentals.filter(
      (rental) =>
        rental.status === "ACTIVE"
    ).length;

  const returnedRentals =
    rentals.filter(
      (rental) =>
        rental.status === "RETURNED"
    ).length;

  const overdueRentals =
    rentals.filter(
      (rental) =>
        rental.status === "OVERDUE"
    ).length;

  const totalRentalAmount =
    rentals.reduce(
      (total, rental) =>
        total +
        Number(
          rental.rentalAmount || 0
        ),
      0
    );

  const settledRentals =
    rentals.filter(
      (rental) =>
        rental.settlementStatus ===
        "SETTLED"
    );

  const pendingSettlements =
    rentals.filter(
      (rental) =>
        rental.settlementStatus ===
        "PENDING"
    );

  const settledAmount =
    settledRentals.reduce(
      (total, rental) =>
        total +
        Number(
          rental.rentalAmount || 0
        ),
      0
    );

  const pendingSettlementAmount =
    pendingSettlements.reduce(
      (total, rental) =>
        total +
        Number(
          rental.rentalAmount || 0
        ),
      0
    );

  return {
    summary: {
      totalRentals,
      activeRentals,
      returnedRentals,
      overdueRentals,

      totalRentalAmount,

      settledAmount,

      pendingSettlementAmount,
    },

    rentals: rentals.map(
      (rental) => ({
        id: rental.id,

        member: rental.member
          ? {
              id: rental.member.id,
              name:
                rental.member.name,
              email:
                rental.member.email,
            }
          : null,

        librarian: rental.librarian
          ? {
              id:
                rental.librarian.id,
              name:
                rental.librarian.name,
              email:
                rental.librarian.email,
            }
          : null,

        book: rental.book
          ? {
              id: rental.book.id,
              title:
                rental.book.title,
              author:
                rental.book.author,
              isbn:
                rental.book.isbn,
            }
          : null,

        rentedAt:
          rental.rentedAt,

        dueDate:
          rental.dueDate,

        returnedAt:
          rental.returnedAt,

        rentalAmount:
          Number(
            rental.rentalAmount || 0
          ),

        quantity:
          rental.quantity,

        settlementStatus:
          rental.settlementStatus,

        settledAt:
          rental.settledAt,

        status:
          rental.status,

        createdAt:
          rental.createdAt,
      })
    ),
  };
};

module.exports = {
  getRentalReport,
};