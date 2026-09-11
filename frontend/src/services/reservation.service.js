"use client";

import api from "../lib/api";

// Create reservation
export const createReservation = async (data) => {
  const response = await api.post("/reservations", data);

  return response.data;
};

// Get my reservations
export const getMyReservations = async () => {
  const response = await api.get("/reservations/my");

  return response.data;
};

// Get all reservations
export const getAllReservations = async () => {
  const response = await api.get("/reservations");

  return response.data;
};

// Get reservation by ID
export const getReservationById = async (reservationId) => {
  const response = await api.get(
    `/reservations/${reservationId}`
  );

  return response.data;
};

// Approve reservation
export const approveReservation = async (reservationId) => {
  const response = await api.put(
    `/reservations/${reservationId}/approve`
  );

  return response.data;
};

// Reject reservation
export const rejectReservation = async (
  reservationId,
  reason
) => {
  const response = await api.put(
    `/reservations/${reservationId}/reject`,
    {
      reason,
    }
  );

  return response.data;
};

// Cancel reservation
export const cancelReservation = async (
  reservationId,
  reason
) => {
  const response = await api.put(
    `/reservations/${reservationId}/cancel`,
    {
      reason,
    }
  );

  return response.data;
};

// Complete reservation
export const completeReservation = async (reservationId) => {
  const response = await api.put(
    `/reservations/${reservationId}/complete`
  );

  return response.data;
};

// Expire reservations
export const expireReservations = async () => {
  const response = await api.put("/reservations/expire");

  return response.data;
};