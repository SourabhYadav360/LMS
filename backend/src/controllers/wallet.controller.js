"use strict";

const {
  getWallet,
  fundMemberWallet,
  transferRentToLibrarian,
  getTransactions,
  getSuperAdminRevenue,
} = require("../services/wallet");

// ======================================================
// GET WALLET
// ======================================================

const getMyWallet = async (req, res, next) => {
  try {
    const result = await getWallet({
      walletType: req.user.role,
      ownerId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET TRANSACTIONS
// ======================================================

const getMyTransactions = async (req, res, next) => {
  try {
    const result = await getTransactions({
      walletType: req.user.role,
      ownerId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// FUND MEMBER WALLET
// LIBRARIAN → MEMBER
// ======================================================

const fundMember = async (req, res, next) => {
  try {
    const {
      memberId,
      amount,
      description,
    } = req.body;

    const result = await fundMemberWallet({
      librarianId: req.user.userId,
      memberId,
      amount,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "Member wallet funded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// TRANSFER RENT
// MEMBER → LIBRARIAN
// ======================================================

const transferRent = async (req, res, next) => {
  try {
    const {
      librarianId,
      amount,
      rentalId,
    } = req.body;

    const result = await transferRentToLibrarian({
      memberId: req.user.userId,
      librarianId,
      amount,
      rentalId,
    });

    return res.status(200).json({
      success: true,
      message: "Rent transferred successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// ADD FINE
// LIBRARIAN → MEMBER FINE
// ======================================================


// ======================================================
// GET SUPER ADMIN REVENUE
// ======================================================

const getRevenue = async (req, res, next) => {
  try {
    const {
      fromDate,
      toDate,
    } = req.query;

    const result = await getSuperAdminRevenue({
      superAdminId: req.user.userId,
      fromDate,
      toDate,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getMyWallet,
  getMyTransactions,
  fundMember,
  transferRent,
  
  getRevenue,
};