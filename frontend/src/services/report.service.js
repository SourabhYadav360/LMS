"use client";

import api from "../lib/api";

// Book Report
export const getBookReport = async () => {
  const response = await api.get("/reports/books");

  return response.data;
};

// Rental Report
export const getRentalReport = async ({
  fromDate,
  toDate,
} = {}) => {
  const response = await api.get("/reports/rentals", {
    params: {
      fromDate,
      toDate,
    },
  });

  return response.data;
};

// Reservation Report
export const getReservationReport = async ({
  fromDate,
  toDate,
} = {}) => {
  const response = await api.get("/reports/reservations", {
    params: {
      fromDate,
      toDate,
    },
  });

  return response.data;
};

// Fine Report
export const getFineReport = async () => {
  const response = await api.get("/reports/fines");

  return response.data;
};

// Revenue Report
export const getRevenueReport = async ({
  fromDate,
  toDate,
} = {}) => {
  const response = await api.get("/reports/revenue", {
    params: {
      fromDate,
      toDate,
    },
  });

  return response.data;
};

// Member Report
export const getMemberReport = async () => {
  const response = await api.get("/reports/members");

  return response.data;
};