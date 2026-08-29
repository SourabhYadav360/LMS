"use client";

import api from "@/lib/api";

// ======================================================
// CREATE RESERVATION
// MEMBER
// ======================================================

export const createReservation = async (bookId) => {
  return await api("/reservations", {
    method: "POST",

    body: JSON.stringify({
      bookId,
    }),
  });
};

// ======================================================
// GET MY RESERVATIONS
// MEMBER
// ======================================================

export const getMyReservations = async () => {
  return await api("/reservations/my-reservations", {
    method: "GET",
  });
};

// ======================================================
// GET SINGLE RESERVATION
// MEMBER
// ======================================================

export const getReservationById = async (
  reservationId
) => {
  return await api(
    `/reservations/${reservationId}`,
    {
      method: "GET",
    }
  );
};

// ======================================================
// CANCEL RESERVATION
// MEMBER
// ======================================================

export const cancelReservation = async (
  reservationId,
  reason = ""
) => {
  return await api(
    `/reservations/${reservationId}/cancel`,
    {
      method: "POST",

      body: JSON.stringify({
        reason,
      }),
    }
  );
};

// ======================================================
// GET ALL RESERVATIONS
// SUPER ADMIN + LIBRARIAN
// ======================================================

export const getAllReservations = async () => {
  return await api("/reservations", {
    method: "GET",
  });
};

// ======================================================
// APPROVE RESERVATION
// SUPER ADMIN + LIBRARIAN
// ======================================================

export const approveReservation = async (
  reservationId
) => {
  return await api(
    `/reservations/${reservationId}/approve`,
    {
      method: "POST",
    }
  );
};

// ======================================================
// REJECT RESERVATION
// SUPER ADMIN + LIBRARIAN
// ======================================================

export const rejectReservation = async (
  reservationId,
  reason = ""
) => {
  return await api(
    `/reservations/${reservationId}/reject`,
    {
      method: "POST",

      body: JSON.stringify({
        reason,
      }),
    }
  );
};

// ======================================================
// COMPLETE RESERVATION
// SUPER ADMIN + LIBRARIAN
// ======================================================

export const completeReservation = async (
  reservationId
) => {
  return await api(
    `/reservations/${reservationId}/complete`,
    {
      method: "POST",
    }
  );
};