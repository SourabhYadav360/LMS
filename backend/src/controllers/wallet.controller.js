"use strict";

const walletService = require("../services/wallet.service");

// ======================================================
// GET MY WALLET
// ======================================================

const getMyWallet = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const walletType = req.user.role;

    const wallet =
      await walletService.getWallet({
        walletType,
        ownerId,
      });

    return res.status(200).json({
      success: true,
      message: "Wallet fetched successfully",
      data: {
        wallet,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// LIBRARIAN → MEMBER FUNDING
// ======================================================

const fundMemberWallet = async (
  req,
  res
) => {
  try {
    const librarianId =
      req.user.userId;

    const {
      memberId,
      amount,
      description,
    } = req.body;

    const result =
      await walletService.fundMemberWallet({
        librarianId,
        memberId,
        amount,
        description,
      });

    return res.status(200).json({
      success: true,
      message:
        "Money transferred to member wallet successfully",
      data: result,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// GET MY TRANSACTIONS
// ======================================================

const getMyTransactions = async (
  req,
  res
) => {
  try {
    const ownerId =
      req.user.userId;

    const walletType =
      req.user.role;

    const transactions =
      await walletService.getTransactions({
        walletType,
        ownerId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Wallet transactions fetched successfully",
      data: {
        transactions,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// PAY FINE
// ======================================================

const payFine = async (
  req,
  res
) => {
  try {
    const memberId =
      req.user.userId;

    const {
      amount,
      description,
    } = req.body;

    const result =
      await walletService.payFine({
        memberId,
        amount,
        description,
      });

    return res.status(200).json({
      success: true,
      message:
        "Fine paid successfully",
      data: result,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// GET WALLET BY OWNER
// ADMIN / LIBRARIAN USE
// ======================================================

const getWalletByOwner = async (
  req,
  res
) => {
  try {
    const {
      walletType,
      ownerId,
    } = req.params;

    const wallet =
      await walletService.getWallet({
        walletType,
        ownerId: Number(ownerId),
      });

    return res.status(200).json({
      success: true,
      message:
        "Wallet fetched successfully",
      data: {
        wallet,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getMyWallet,
  fundMemberWallet,
  getMyTransactions,
  payFine,
  getWalletByOwner,
};