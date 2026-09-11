"use client";

import api from "../lib/api";

// Get my wallet
export const getMyWallet = async () => {
  const response = await api.get("/wallet");

  return response.data;
};

// Get my wallet transactions
export const getMyTransactions = async () => {
  const response = await api.get("/wallet/transactions");

  return response.data;
};

// Fund member wallet
export const fundMemberWallet = async (data) => {
  const response = await api.post(
    "/wallet/fund-member",
    data
  );

  return response.data;
};

// Get Super Admin revenue
export const getSuperAdminRevenue = async ({
  fromDate,
  toDate,
} = {}) => {
  const response = await api.get("/wallet/revenue", {
    params: {
      fromDate,
      toDate,
    },
  });

  return response.data;
};