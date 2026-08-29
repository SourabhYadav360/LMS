"use client";

import api from "@/lib/api";

// ======================================================
// GET MY WALLET
// Backend: GET /wallet/my-wallet
// ======================================================

export const getMyWallet = async () => {
  return await api("/wallet/my-wallet", {
    method: "GET",
  });
};

// ======================================================
// GET MY TRANSACTIONS
// Backend: GET /wallet/my-transactions
// ======================================================

export const getMyTransactions = async () => {
  return await api("/wallet/my-transactions", {
    method: "GET",
  });
};

// ======================================================
// GET WALLET BY OWNER
// SUPER ADMIN / LIBRARIAN
// Backend: GET /wallet/:walletType/:ownerId
// ======================================================

export const getWallet = async (walletType, ownerId) => {
  return await api(`/wallet/${walletType}/${ownerId}`, {
    method: "GET",
  });
};

// ======================================================
// LIBRARIAN → MEMBER FUNDING
//
// Librarian member ko money add kar sakta hai.
// Librarian ke wallet se balance deduct NAHI hoga.
//
// Backend: POST /wallet/fund-member
// ======================================================

export const fundMemberWallet = async ({
  memberId,
  amount,
  description = "Money added by librarian",
}) => {
  if (!memberId) {
    throw new Error("Member ID is required");
  }

  if (!amount || Number(amount) <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  return await api("/wallet/fund-member", {
    method: "POST",

    body: JSON.stringify({
      memberId,
      amount: Number(amount),
      description,
    }),
  });
};

// ======================================================
// MEMBER PAY FINE
// Backend: POST /wallet/pay-fine
// ======================================================

export const payFine = async ({
  amount,
  description = "Fine payment",
}) => {
  if (!amount || Number(amount) <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  return await api("/wallet/pay-fine", {
    method: "POST",

    body: JSON.stringify({
      amount: Number(amount),
      description,
    }),
  });
};