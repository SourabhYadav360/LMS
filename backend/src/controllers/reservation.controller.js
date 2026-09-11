"use strict";

const {
  rejectReservation,
  getReservationById,
  getMyReservations,
  getAllReservations,
  expireReservations,
  createReservation,
  completeReservation,
  cancelReservation,
  approveReservation,
} = require("../services/reservation");

// Create Reservation
const create = async (req, res, next) => {
  try {
    const { bookId } = req.body;

    const result = await createReservation({
      memberId: req.user.userId,
      bookId,
    });

    return res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get My Reservations
const getMy = async (req, res, next) => {
  try {
    const result = await getMyReservations(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get Reservation By ID
const getById = async (req, res, next) => {
  try {
    const reservationId =
      req.params.reservationId ||
      req.params.id ||
      req.body.reservationId;

    const result = await getReservationById({
      memberId: req.user.userId,
      reservationId,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Reservations
const getAll = async (req, res, next) => {
  try {
    const result = await getAllReservations();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Approve Reservation
const approve = async (req, res, next) => {
  try {
    const reservationId =
      req.params.reservationId ||
      req.params.id ||
      req.body.reservationId;

    const result = await approveReservation(
      reservationId
    );

    return res.status(200).json({
      success: true,
      message: "Reservation approved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Reject Reservation
const reject = async (req, res, next) => {
  try {
    const {
      reason,
    } = req.body;

    const reservationId =
      req.params.reservationId ||
      req.params.id ||
      req.body.reservationId;

    const result = await rejectReservation({
      reservationId,
      reason,
    });

    return res.status(200).json({
      success: true,
      message: "Reservation rejected successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel Reservation
const cancel = async (req, res, next) => {
  try {
    const {
      reason,
    } = req.body;

    const reservationId =
      req.params.reservationId ||
      req.params.id ||
      req.body.reservationId;

    const result = await cancelReservation({
      memberId: req.user.userId,
      reservationId,
      reason,
    });

    return res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Complete Reservation
const complete = async (req, res, next) => {
  try {
    const reservationId =
      req.params.reservationId ||
      req.params.id ||
      req.body.reservationId;

    const result = await completeReservation(
      reservationId
    );

    return res.status(200).json({
      success: true,
      message: "Reservation completed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Expire Reservations
const expire = async (req, res, next) => {
  try {
    const result = await expireReservations();

    return res.status(200).json({
      success: true,
      message: "Reservations expired successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getMy,
  getById,
  getAll,
  approve,
  reject,
  cancel,
  complete,
  expire,
};