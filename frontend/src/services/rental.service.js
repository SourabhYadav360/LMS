"use client";

import api from "../lib/api";

// Rent a book
export const rentBook = async (data) => {
  const response = await api.post("/rentals", data);

  return response.data;
};

// Get my rentals
export const getMyRentals = async () => {
  const response = await api.get("/rentals/my");

  return response.data;
};

// Get all rentals
export const getAllRentals = async () => {
  const response = await api.get("/rentals");

  return response.data;
};

// Get rental by ID
export const getRentalById = async (rentalId) => {
  const response = await api.get(`/rentals/${rentalId}`);

  return response.data;
};

// Return book
export const returnBook = async (rentalId) => {
  const response = await api.post(
    `/rentals/${rentalId}/return`
  );

  return response.data;
};