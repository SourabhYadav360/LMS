"use strict";

const express = require("express");

const walletController = require("../controllers/wallet.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const router = express.Router();

// ======================================================
// GET MY WALLET
// MEMBER / LIBRARIAN / SUPER ADMIN
// ======================================================

router.get(
  "/my-wallet",
  authenticate,
  authorize(
    "MEMBER",
    "LIBRARIAN",
    "SUPER_ADMIN"
  ),
  walletController.getMyWallet
);

// ======================================================
// GET MY TRANSACTIONS
// MEMBER / LIBRARIAN / SUPER ADMIN
// ======================================================

router.get(
  "/my-transactions",
  authenticate,
  authorize(
    "MEMBER",
    "LIBRARIAN",
    "SUPER_ADMIN"
  ),
  walletController.getMyTransactions
);

// ======================================================
// LIBRARIAN → MEMBER WALLET
// ======================================================

router.post(
  "/fund-member",
  authenticate,
  authorize("LIBRARIAN"),
  walletController.fundMemberWallet
);

// ======================================================
// MEMBER PAY FINE
// ======================================================

router.post(
  "/pay-fine",
  authenticate,
  authorize("MEMBER"),
  walletController.payFine
);

// ======================================================
// ADMIN / LIBRARIAN GET ANY WALLET
// ======================================================

router.get(
  "/:walletType/:ownerId",
  authenticate,
  authorize(
    "SUPER_ADMIN",
    "LIBRARIAN"
  ),
  walletController.getWalletByOwner
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;