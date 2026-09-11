"use strict";

const {
  SuperAdminWallet,
  LibrarianWallet,
  MemberWallet,
  WalletTransaction,
} = require("../../models");

// ======================================================
// GET WALLET MODEL
// ======================================================

const getWalletModel = (walletType) => {
  switch (walletType) {
    case "SUPER_ADMIN":
      return SuperAdminWallet;

    case "LIBRARIAN":
      return LibrarianWallet;

    case "MEMBER":
      return MemberWallet;

    default: {
      const error = new Error(
        "Invalid wallet type"
      );

      error.statusCode = 400;

      throw error;
    }
  }
};

// ======================================================
// GET OWNER FIELD
// ======================================================

const getOwnerField = (walletType) => {
  switch (walletType) {
    case "SUPER_ADMIN":
      return "superAdminId";

    case "LIBRARIAN":
      return "librarianId";

    case "MEMBER":
      return "memberId";

    default: {
      const error = new Error(
        "Invalid wallet type"
      );

      error.statusCode = 400;

      throw error;
    }
  }
};

// ======================================================
// GET WALLET TRANSACTIONS
// ======================================================

const getTransactions = async ({walletType,ownerId,}) => {
  const WalletModel = getWalletModel(walletType);
  const ownerField = getOwnerField(walletType);
  const wallet = await WalletModel.findOne({
      where: {
        [ownerField]: ownerId,
      },
    });

  if (!wallet) {
    return [];
  }

  const transactions = await WalletTransaction.findAll({
      where: {
        walletType,
        walletId:wallet.id,
      },
      order: [
        ["createdAt", "DESC"],
      ],
    });

  return transactions;
};

module.exports = {
  getTransactions,
};