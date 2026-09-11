"use strict";

const express = require("express");

const {
  getMyWallet,
  getMyTransactions,
  fundMember,
  transferRent,
  getRevenue,
} = require("../controllers/wallet.controller");

const { authenticate } = require("../middlewares/auth.middleware");
const {
  requirePermission,
} = require("../middlewares/permission.middleware");

const router = express.Router();

// ======================================================
// GET MY WALLET
// ======================================================

router.get(
  "/",
  authenticate,
  requirePermission("walletView"),
  getMyWallet
);

// ======================================================
// GET MY TRANSACTIONS
// ======================================================

router.get(
  "/transactions",
  authenticate,
  requirePermission("walletView"),
  getMyTransactions
);

// ======================================================
// FUND MEMBER WALLET
// LIBRARIAN → MEMBER
// ======================================================

router.post(
  "/fund-member",
  authenticate,
  requirePermission("walletManage"),
  fundMember
);

// ======================================================
// TRANSFER RENT
// MEMBER → LIBRARIAN
// ======================================================

router.post(
  "/transfer-rent",
  authenticate,
  requirePermission("walletManage"),
  transferRent  // 
);

// ======================================================
// GET SUPER ADMIN REVENUE
// ======================================================

router.get(
  "/revenue",
  authenticate,
  requirePermission("walletView"),
  getRevenue // This route is for super admin to get revenue details
);

module.exports = router;