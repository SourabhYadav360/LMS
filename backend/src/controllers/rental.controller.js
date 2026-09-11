"use strict";

const {
  rentBook: rentBookService,
  getMyRentals: getMyRentalsService,
  getRentalById: getRentalByIdService,
  returnBook: returnBookService,
  getAllRentals: getAllRentalsService,
} = require("../services/rental");

// ======================================================
// MEMBER → RENT BOOK
// ======================================================

const rentBook = async (req, res, next) => {
  try {
    // JWT se logged-in member ki ID
    const memberId = req.user.userId;

    const { bookId, days, quantity } = req.body;

    const result = await rentBookService({
      memberId,
      bookId,
      days,
      quantity,
    });

    return res.status(201).json({
      success: true,
      message: "Book rented successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// MEMBER → GET MY RENTALS
// ======================================================

const getMyRentals = async (req, res, next) => {
  try {
    const memberId = req.user.userId;

    const rentals = await getMyRentalsService(
      memberId
    );

    return res.status(200).json({
      success: true,
      message: "Rentals fetched successfully",
      data: {
        rentals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// MEMBER → GET SINGLE RENTAL
// ======================================================

const getRentalById = async (req, res, next) => {
  try {
    const memberId = req.user.userId;

    const { rentalId } = req.params;

    const rental = await getRentalByIdService({
      memberId,
      rentalId,
    });

    return res.status(200).json({
      success: true,
      message: "Rental fetched successfully",
      data: {
        rental,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// MEMBER → RETURN BOOK
// ======================================================

const returnBook = async (req, res, next) => {
  try {
    const memberId = req.user.userId;

    const { rentalId } = req.params;

    const result = await returnBookService({
      memberId,
      rentalId,
    });

    return res.status(200).json({
      success: true,
      message: "Book returned successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// ADMIN / LIBRARIAN → GET ALL RENTALS
// ======================================================

const getAllRentals = async (req, res, next) => {
  try {
    const rentals = await getAllRentalsService();

    return res.status(200).json({
      success: true,
      message: "All rentals fetched successfully",
      data: {
        rentals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  rentBook,
  getMyRentals,
  getRentalById,
  returnBook,
  getAllRentals,
};