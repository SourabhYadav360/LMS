"use client";

import api from "@/lib/api";

// ======================================================
// RENT BOOK
// ======================================================

export const rentBook = async ({ bookId, days }) => {
  return await api("/rentals", {
    method: "POST",

    body: JSON.stringify({
      bookId,
      days,
    }),
  });
};

// ======================================================
// GET MY RENTALS
// ======================================================

export const getMyRentals = async () => {
  return await api("/rentals/my-rentals", {
    method: "GET",
  });
};

// ======================================================
// GET ALL RENTALS
// ADMIN + LIBRARIAN
// ======================================================

export const getAllRentals = async () => {
  return await api("/rentals", {
    method: "GET",
  });
};

// ======================================================
// GET SINGLE RENTAL
// ======================================================

export const getRentalById = async (rentalId) => {
  return await api(`/rentals/${rentalId}`, {
    method: "GET",
  });
};

// ======================================================
// RETURN BOOK
// ======================================================

export const returnBook = async (rentalId) => {
  return await api(`/rentals/${rentalId}/return`, {
    method: "POST",
  });
};