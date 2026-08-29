"use strict";

const reservationService = require(
  "../services/reservation.service"
);

// ======================================================
// CREATE RESERVATION
// MEMBER
// ======================================================

const createReservation = async (
  req,
  res
) => {
  try {
    const memberId =
      req.user.userId;

    const { bookId } = req.body;

    const reservation =
      await reservationService.createReservation({
        memberId,
        bookId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Book reservation created successfully",
      data: {
        reservation,
      },
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message:
          error.message ||
          "Something went wrong",
      });
  }
};

// ======================================================
// GET MY RESERVATIONS
// MEMBER
// ======================================================

const getMyReservations = async (
  req,
  res
) => {
  try {
    const memberId =
      req.user.userId;

    const reservations =
      await reservationService.getMyReservations(
        memberId
      );

    return res.status(200).json({
      success: true,
      message:
        "Reservations fetched successfully",

      data: {
        reservations,
      },
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message:
          error.message ||
          "Something went wrong",
      });
  }
};

// ======================================================
// GET SINGLE RESERVATION
// MEMBER
// ======================================================

const getReservationById = async (
  req,
  res
) => {
  try {
    const memberId =
      req.user.userId;

    const { reservationId } =
      req.params;

    const reservation =
      await reservationService.getReservationById({
        memberId,
        reservationId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Reservation fetched successfully",

      data: {
        reservation,
      },
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message:
          error.message ||
          "Something went wrong",
      });
  }
};

// ======================================================
// CANCEL RESERVATION
// MEMBER
// ======================================================

const cancelReservation = async (
  req,
  res
) => {
  try {
    const memberId =
      req.user.userId;

    const { reservationId } =
      req.params;

    const { reason } = req.body;

    const reservation =
      await reservationService.cancelReservation({
        memberId,
        reservationId,
        reason,
      });

    return res.status(200).json({
      success: true,
      message:
        "Reservation cancelled successfully",

      data: {
        reservation,
      },
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message:
          error.message ||
          "Something went wrong",
      });
  }
};

// ======================================================
// GET ALL RESERVATIONS
// LIBRARIAN + SUPER ADMIN
// ======================================================

const getAllReservations = async (
  req,
  res
) => {
  try {
    const reservations =
      await reservationService.getAllReservations();

    return res.status(200).json({
      success: true,
      message:
        "Reservations fetched successfully",

      data: {
        reservations,
      },
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message:
          error.message ||
          "Something went wrong",
      });
  }
};

// ======================================================
// APPROVE
// LIBRARIAN + SUPER ADMIN
// ======================================================

const approveReservation = async (
  req,
  res
) => {
  try {
    const { reservationId } =
      req.params;

    const reservation =
      await reservationService.approveReservation(
        reservationId
      );

    return res.status(200).json({
      success: true,
      message:
        "Reservation approved successfully",

      data: {
        reservation,
      },
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message:
          error.message ||
          "Something went wrong",
      });
  }
};

// ======================================================
// REJECT
// LIBRARIAN + SUPER ADMIN
// ======================================================

const rejectReservation = async (
  req,
  res
) => {
  try {
    const { reservationId } =
      req.params;

    const { reason } = req.body;

    const reservation =
      await reservationService.rejectReservation({
        reservationId,
        reason,
      });

    return res.status(200).json({
      success: true,
      message:
        "Reservation rejected successfully",

      data: {
        reservation,
      },
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message:
          error.message ||
          "Something went wrong",
      });
  }
};

// ======================================================
// COMPLETE
// LIBRARIAN + SUPER ADMIN
// ======================================================

const completeReservation = async (
  req,
  res
) => {
  try {
    const { reservationId } =
      req.params;

    const reservation =
      await reservationService.completeReservation(
        reservationId
      );

    return res.status(200).json({
      success: true,
      message:
        "Reservation completed successfully",

      data: {
        reservation,
      },
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message:
          error.message ||
          "Something went wrong",
      });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  getAllReservations,
  approveReservation,
  rejectReservation,
  completeReservation,
};