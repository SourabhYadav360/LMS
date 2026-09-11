"use strict";

const {SuperAdminWallet,LibrarianWallet,MemberWallet,} = require("../../models");

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

    default:
      throw new Error("Invalid wallet type");
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

    default:
      throw new Error("Invalid wallet type");
  }
};

// ======================================================
// GET WALLET
// ======================================================

const getWallet = async ({
  walletType,
  ownerId,
}) => {

  // 1. Wallet ka model decide hoga
  const WalletModel =
    getWalletModel(walletType);

  // 2. Owner ki ID ka column decide hoga
  const ownerField =
    getOwnerField(walletType);

  // 3. Wallet database me find karo
  let wallet = await WalletModel.findOne({
    where: {
      [ownerField]: ownerId,
    },
  });

  // 4. Wallet nahi hai to create karo
  if (!wallet) {
    wallet = await WalletModel.create({
      [ownerField]: ownerId,
      balance: 0,

      ...(walletType === "MEMBER" && {
        fine: 0,
        fundedByLibrarianId: null,
      }),
    });
  }

  // 5. Frontend ko safe data return karo
  return {
    id: wallet.id,

    walletType,

    ownerId,

    balance: Number(wallet.balance),

    ...(walletType === "MEMBER" && {
      fine: Number(wallet.fine),

      fundedByLibrarianId:
        wallet.fundedByLibrarianId,
    }),
  };
};

module.exports = {
  getWallet,
};