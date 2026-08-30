"use strict";

const rentalService = require("../services/rental.service");

// ======================================================
// MEMBER → RENT BOOK
// ======================================================

const rentBook = async (req, res) => {
  try {
    // JWT se logged-in member ki ID
    const memberId = req.user.userId;

    const { bookId, days, quantity } = req.body;

    const result = await rentalService.rentBook({
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
    console.error("Rent Book Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// ======================================================
// MEMBER → GET MY RENTALS
// ======================================================

const getMyRentals = async (req, res) => {
  try {
    const memberId = req.user.userId;

    const rentals = await rentalService.getMyRentals(
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
    console.error("Get My Rentals Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// ======================================================
// MEMBER → GET SINGLE RENTAL
// ======================================================

const getRentalById = async (req, res) => {
  try {
    const memberId = req.user.userId;

    const { rentalId } = req.params;

    const rental = await rentalService.getRentalById({
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
    console.error("Get Rental Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// ======================================================
// MEMBER → RETURN BOOK
// ======================================================

const returnBook = async (req, res) => {
  try {
    const memberId = req.user.userId;

    const { rentalId } = req.params;

    const result = await rentalService.returnBook({
      memberId,
      rentalId,
    });

    return res.status(200).json({
      success: true,
      message: "Book returned successfully",
      data: result,
    });
  } catch (error) {
    console.error("Return Book Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// ======================================================
// ADMIN / LIBRARIAN → GET ALL RENTALS
// ======================================================

const getAllRentals = async (req, res) => {
  try {
    const rentals = await rentalService.getAllRentals();

    return res.status(200).json({
      success: true,
      message: "All rentals fetched successfully",
      data: {
        rentals,
      },
    });
  } catch (error) {
    console.error("Get All Rentals Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
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