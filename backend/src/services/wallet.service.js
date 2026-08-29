"use strict";

const {
  SuperAdminWallet,
  LibrarianWallet,
  MemberWallet,
  WalletTransaction,
} = require("../models");

const { sequelize } = require("../models");
const { Op } = require("sequelize");

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
      const error = new Error("Invalid wallet type");
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
      const error = new Error("Invalid wallet type");
      error.statusCode = 400;
      throw error;
    }
  }
};

// ======================================================
// GET / CREATE WALLET
// ======================================================

const getWallet = async ({
  walletType,
  ownerId,
}) => {
  const WalletModel =
    getWalletModel(walletType);

  const ownerField =
    getOwnerField(walletType);

  let wallet =
    await WalletModel.findOne({
      where: {
        [ownerField]: ownerId,
      },
    });

  // Create wallet if not exists
  if (!wallet) {
    wallet =
      await WalletModel.create({
        [ownerField]: ownerId,
        balance: 0,

        ...(walletType === "MEMBER" && {
          fine: 0,
          fundedByLibrarianId: null,
        }),
      });
  }

  return {
    id: wallet.id,

    walletType,

    ownerId,

    balance:
      Number(wallet.balance),

    ...(walletType === "MEMBER" && {
      fine:
        Number(wallet.fine),

      fundedByLibrarianId:
        wallet.fundedByLibrarianId,
    }),
  };
};

// ======================================================
// LIBRARIAN → MEMBER FUNDING
// ======================================================
//
// IMPORTANT:
//
// Librarian member ke wallet me money add karega.
//
// Librarian ke wallet se money DEDUCT nahi hoga.
//
// Example:
//
// Librarian Wallet = ₹0
// Member Wallet    = ₹100
//
// Librarian adds ₹500
//
// Librarian Wallet = ₹0
// Member Wallet    = ₹600
//
// ======================================================

const fundMemberWallet = async ({
  librarianId,
  memberId,
  amount,
  description,
}) => {
  const fundAmount =
    Number(amount);

  // ====================================================
  // VALIDATE AMOUNT
  // ====================================================

  if (
    !Number.isFinite(fundAmount) ||
    fundAmount <= 0
  ) {
    const error = new Error(
      "Amount must be greater than 0"
    );

    error.statusCode = 400;

    throw error;
  }

  const transaction =
    await sequelize.transaction();

  try {
    // ==================================================
    // GET MEMBER WALLET
    // ==================================================

    let memberWallet =
      await MemberWallet.findOne({
        where: {
          memberId,
        },

        transaction,

        lock:
          transaction.LOCK.UPDATE,
      });

    // ==================================================
    // CREATE MEMBER WALLET
    // ==================================================

    if (!memberWallet) {
      memberWallet =
        await MemberWallet.create(
          {
            memberId,

            balance: 0,

            fine: 0,

            fundedByLibrarianId:
              librarianId,
          },
          {
            transaction,
          }
        );
    }

    // ==================================================
    // MEMBER BALANCE
    // ==================================================

    const memberBalanceBefore =
      Number(
        memberWallet.balance
      );

    const memberBalanceAfter =
      memberBalanceBefore +
      fundAmount;

    // ==================================================
    // UPDATE MEMBER WALLET
    // ==================================================

    await memberWallet.update(
      {
        balance:
          memberBalanceAfter,

        fundedByLibrarianId:
          librarianId,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // CREATE MEMBER CREDIT TRANSACTION
    // ==================================================

    await WalletTransaction.create(
      {
        walletType:
          "MEMBER",

        walletId:
          memberWallet.id,

        type:
          "CREDIT",

        amount:
          fundAmount,

        balanceBefore:
          memberBalanceBefore,

        balanceAfter:
          memberBalanceAfter,

        description:
          description ||
          "Money added by librarian",

        referenceType:
          "MEMBER_FUNDING",

        referenceId:
          librarianId,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // COMMIT
    // ==================================================

    await transaction.commit();

    // ==================================================
    // RESPONSE
    // ==================================================

    return {
      success: true,

      memberId,

      librarianId,

      amount:
        fundAmount,

      memberWallet: {
        balanceBefore:
          memberBalanceBefore,

        balanceAfter:
          memberBalanceAfter,
      },
    };
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
};

// ======================================================
// RENT PAYMENT
// MEMBER → LIBRARIAN
// ======================================================
//
// Member book rent karega.
//
// Member Wallet      -₹100
// Librarian Wallet   +₹100
//
// ======================================================

const transferRentToLibrarian = async ({
  memberId,
  librarianId,
  amount,
  rentalId,
  transaction:
    externalTransaction = null,
}) => {
  const rentAmount =
    Number(amount);

  // ====================================================
  // VALIDATE AMOUNT
  // ====================================================

  if (
    !Number.isFinite(rentAmount) ||
    rentAmount <= 0
  ) {
    const error = new Error(
      "Rent amount must be greater than 0"
    );

    error.statusCode = 400;

    throw error;
  }

  const transaction =
    externalTransaction ||
    await sequelize.transaction();

  try {
    // ==================================================
    // GET MEMBER WALLET
    // ==================================================

    const memberWallet =
      await MemberWallet.findOne({
        where: {
          memberId,
        },

        transaction,

        lock:
          transaction.LOCK.UPDATE,
      });

    if (!memberWallet) {
      const error = new Error(
        "Member wallet not found"
      );

      error.statusCode = 404;

      throw error;
    }

    // ==================================================
    // MEMBER BALANCE
    // ==================================================

    const memberBalanceBefore =
      Number(
        memberWallet.balance
      );

    // ==================================================
    // CHECK MEMBER BALANCE
    // ==================================================

    if (
      rentAmount >
      memberBalanceBefore
    ) {
      const error = new Error(
        "Insufficient wallet balance"
      );

      error.statusCode = 400;

      throw error;
    }

    // ==================================================
    // GET / CREATE LIBRARIAN WALLET
    // ==================================================

    let librarianWallet =
      await LibrarianWallet.findOne({
        where: {
          librarianId,
        },

        transaction,

        lock:
          transaction.LOCK.UPDATE,
      });

    if (!librarianWallet) {
      librarianWallet =
        await LibrarianWallet.create(
          {
            librarianId,

            balance: 0,
          },
          {
            transaction,
          }
        );
    }

    // ==================================================
    // MEMBER DEBIT
    // ==================================================

    const memberBalanceAfter =
      memberBalanceBefore -
      rentAmount;

    await memberWallet.update(
      {
        balance:
          memberBalanceAfter,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // MEMBER TRANSACTION
    // ==================================================

    await WalletTransaction.create(
      {
        walletType:
          "MEMBER",

        walletId:
          memberWallet.id,

        type:
          "DEBIT",

        amount:
          rentAmount,

        balanceBefore:
          memberBalanceBefore,

        balanceAfter:
          memberBalanceAfter,

        description:
          "Book rental payment",

        referenceType:
          "RENTAL",

        referenceId:
          rentalId,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // LIBRARIAN CREDIT
    // ==================================================

    const librarianBalanceBefore =
      Number(
        librarianWallet.balance
      );

    const librarianBalanceAfter =
      librarianBalanceBefore +
      rentAmount;

    await librarianWallet.update(
      {
        balance:
          librarianBalanceAfter,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // LIBRARIAN TRANSACTION
    // ==================================================

    await WalletTransaction.create(
      {
        walletType:
          "LIBRARIAN",

        walletId:
          librarianWallet.id,

        type:
          "CREDIT",

        amount:
          rentAmount,

        balanceBefore:
          librarianBalanceBefore,

        balanceAfter:
          librarianBalanceAfter,

        description:
          "Book rental income",

        referenceType:
          "RENTAL",

        referenceId:
          rentalId,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // COMMIT
    // ==================================================

    if (!externalTransaction) {
      await transaction.commit();
    }

    return {
      success: true,

      memberId,

      librarianId,

      rentalId,

      amount:
        rentAmount,

      memberWallet: {
        balanceBefore:
          memberBalanceBefore,

        balanceAfter:
          memberBalanceAfter,
      },

      librarianWallet: {
        balanceBefore:
          librarianBalanceBefore,

        balanceAfter:
          librarianBalanceAfter,
      },
    };
  } catch (error) {
    if (!externalTransaction) {
      await transaction.rollback();
    }

    throw error;
  }
};

// ======================================================
// ADD MONEY / GENERIC CREDIT
// ======================================================

const addMoney = async ({
  walletType,
  ownerId,
  amount,
  description,
  referenceType,
  referenceId,
  transaction:
    externalTransaction = null,
}) => {
  const addAmount =
    Number(amount);

  // ====================================================
  // VALIDATE AMOUNT
  // ====================================================

  if (
    !Number.isFinite(addAmount) ||
    addAmount <= 0
  ) {
    const error = new Error(
      "Amount must be greater than 0"
    );

    error.statusCode = 400;

    throw error;
  }

  const WalletModel =
    getWalletModel(walletType);

  const ownerField =
    getOwnerField(walletType);

  const transaction =
    externalTransaction ||
    await sequelize.transaction();

  try {
    // ==================================================
    // GET WALLET
    // ==================================================

    let wallet =
      await WalletModel.findOne({
        where: {
          [ownerField]: ownerId,
        },

        transaction,

        lock:
          transaction.LOCK.UPDATE,
      });

    // ==================================================
    // CREATE WALLET IF NOT EXISTS
    // ==================================================

    if (!wallet) {
      wallet =
        await WalletModel.create(
          {
            [ownerField]: ownerId,

            balance: 0,

            ...(walletType === "MEMBER" && {
              fine: 0,

              fundedByLibrarianId:
                null,
            }),
          },
          {
            transaction,
          }
        );
    }

    // ==================================================
    // BALANCE
    // ==================================================

    const balanceBefore =
      Number(wallet.balance);

    const balanceAfter =
      balanceBefore +
      addAmount;

    // ==================================================
    // UPDATE WALLET
    // ==================================================

    await wallet.update(
      {
        balance:
          balanceAfter,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // TRANSACTION
    // ==================================================

    await WalletTransaction.create(
      {
        walletType,

        walletId:
          wallet.id,

        type:
          "CREDIT",

        amount:
          addAmount,

        balanceBefore,

        balanceAfter,

        description:
          description ||
          "Money added to wallet",

        referenceType:
          referenceType ||
          null,

        referenceId:
          referenceId ||
          null,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // COMMIT
    // ==================================================

    if (!externalTransaction) {
      await transaction.commit();
    }

    return {
      walletId:
        wallet.id,

      walletType,

      ownerId,

      balanceBefore,

      amount:
        addAmount,

      balanceAfter,
    };
  } catch (error) {
    if (!externalTransaction) {
      await transaction.rollback();
    }

    throw error;
  }
};

// ======================================================
// DEDUCT MONEY
// ======================================================

const deductMoney = async ({
  walletType,
  ownerId,
  amount,
  description,
  referenceType,
  referenceId,
  transaction:
    externalTransaction = null,
}) => {
  const deductAmount =
    Number(amount);

  // ====================================================
  // VALIDATE AMOUNT
  // ====================================================

  if (
    !Number.isFinite(deductAmount) ||
    deductAmount <= 0
  ) {
    const error = new Error(
      "Amount must be greater than 0"
    );

    error.statusCode = 400;

    throw error;
  }

  const WalletModel =
    getWalletModel(walletType);

  const ownerField =
    getOwnerField(walletType);

  const transaction =
    externalTransaction ||
    await sequelize.transaction();

  try {
    // ==================================================
    // GET WALLET
    // ==================================================

    const wallet =
      await WalletModel.findOne({
        where: {
          [ownerField]: ownerId,
        },

        transaction,

        lock:
          transaction.LOCK.UPDATE,
      });

    if (!wallet) {
      const error = new Error(
        "Wallet not found"
      );

      error.statusCode = 404;

      throw error;
    }

    // ==================================================
    // BALANCE
    // ==================================================

    const balanceBefore =
      Number(wallet.balance);

    // ==================================================
    // CHECK BALANCE
    // ==================================================

    if (
      deductAmount >
      balanceBefore
    ) {
      const error = new Error(
        "Insufficient wallet balance"
      );

      error.statusCode = 400;

      throw error;
    }

    // ==================================================
    // NEW BALANCE
    // ==================================================

    const balanceAfter =
      balanceBefore -
      deductAmount;

    // ==================================================
    // UPDATE WALLET
    // ==================================================

    await wallet.update(
      {
        balance:
          balanceAfter,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // TRANSACTION
    // ==================================================

    await WalletTransaction.create(
      {
        walletType,

        walletId:
          wallet.id,

        type:
          "DEBIT",

        amount:
          deductAmount,

        balanceBefore,

        balanceAfter,

        description:
          description ||
          "Money deducted from wallet",

        referenceType:
          referenceType ||
          null,

        referenceId:
          referenceId ||
          null,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // COMMIT
    // ==================================================

    if (!externalTransaction) {
      await transaction.commit();
    }

    return {
      walletId:
        wallet.id,

      walletType,

      ownerId,

      balanceBefore,

      amount:
        deductAmount,

      balanceAfter,
    };
  } catch (error) {
    if (!externalTransaction) {
      await transaction.rollback();
    }

    throw error;
  }
};

// ======================================================
// GET TRANSACTIONS
// ======================================================

const getTransactions = async ({
  walletType,
  ownerId,
}) => {
  const WalletModel =
    getWalletModel(walletType);

  const ownerField =
    getOwnerField(walletType);

  // ====================================================
  // GET WALLET
  // ====================================================

  const wallet =
    await WalletModel.findOne({
      where: {
        [ownerField]: ownerId,
      },
    });

  if (!wallet) {
    return [];
  }

  // ====================================================
  // GET TRANSACTIONS
  // ====================================================

  return await WalletTransaction.findAll({
    where: {
      walletType,

      walletId:
        wallet.id,
    },

    order: [
      ["createdAt", "DESC"],
    ],
  });
};

// ======================================================
// ADD FINE
// ======================================================

const addFine = async ({
  memberId,
  amount,
  description,
  referenceType,
  referenceId,
}) => {
  const fineAmount =
    Number(amount);

  // ====================================================
  // VALIDATE AMOUNT
  // ====================================================

  if (
    !Number.isFinite(fineAmount) ||
    fineAmount <= 0
  ) {
    const error = new Error(
      "Fine amount must be greater than 0"
    );

    error.statusCode = 400;

    throw error;
  }

  const transaction =
    await sequelize.transaction();

  try {
    // ==================================================
    // GET MEMBER WALLET
    // ==================================================

    let wallet =
      await MemberWallet.findOne({
        where: {
          memberId,
        },

        transaction,

        lock:
          transaction.LOCK.UPDATE,
      });

    // ==================================================
    // CREATE WALLET IF NOT EXISTS
    // ==================================================

    if (!wallet) {
      wallet =
        await MemberWallet.create(
          {
            memberId,

            balance: 0,

            fine: 0,

            fundedByLibrarianId:
              null,
          },
          {
            transaction,
          }
        );
    }

    // ==================================================
    // FINE
    // ==================================================

    const fineBefore =
      Number(wallet.fine);

    const fineAfter =
      fineBefore +
      fineAmount;

    // ==================================================
    // UPDATE FINE
    // ==================================================

    await wallet.update(
      {
        fine:
          fineAfter,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // COMMIT
    // ==================================================

    await transaction.commit();

    return {
      walletId:
        wallet.id,

      memberId,

      fineBefore,

      fine:
        fineAmount,

      fineAfter,
    };
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
};

// ======================================================
// PAY FINE
// ======================================================
//
// Member ke wallet balance se fine pay hoga.
//
// Example:
//
// Balance = ₹500
// Fine    = ₹100
//
// Pay fine ₹100
//
// Balance = ₹400
// Fine    = ₹0
//
// ======================================================

const payFine = async ({
  memberId,
  amount,
  description,
  referenceType,
  referenceId,
}) => {
  const paymentAmount =
    Number(amount);

  // ====================================================
  // VALIDATE AMOUNT
  // ====================================================

  if (
    !Number.isFinite(
      paymentAmount
    ) ||
    paymentAmount <= 0
  ) {
    const error = new Error(
      "Payment amount must be greater than 0"
    );

    error.statusCode = 400;

    throw error;
  }

  const transaction =
    await sequelize.transaction();

  try {
    // ==================================================
    // GET MEMBER WALLET
    // ==================================================

    const wallet =
      await MemberWallet.findOne({
        where: {
          memberId,
        },

        transaction,

        lock:
          transaction.LOCK.UPDATE,
      });

    if (!wallet) {
      const error = new Error(
        "Member wallet not found"
      );

      error.statusCode = 404;

      throw error;
    }

    // ==================================================
    // CURRENT VALUES
    // ==================================================

    const currentFine =
      Number(wallet.fine);

    const currentBalance =
      Number(wallet.balance);

    // ==================================================
    // CHECK FINE
    // ==================================================

    if (currentFine <= 0) {
      const error = new Error(
        "No pending fine"
      );

      error.statusCode = 400;

      throw error;
    }

    // ==================================================
    // CHECK FINE AMOUNT
    // ==================================================

    if (
      paymentAmount >
      currentFine
    ) {
      const error = new Error(
        "Payment amount cannot exceed pending fine"
      );

      error.statusCode = 400;

      throw error;
    }

    // ==================================================
    // CHECK WALLET BALANCE
    // ==================================================

    if (
      paymentAmount >
      currentBalance
    ) {
      const error = new Error(
        "Insufficient wallet balance"
      );

      error.statusCode = 400;

      throw error;
    }

    // ==================================================
    // NEW VALUES
    // ==================================================

    const balanceBefore =
      currentBalance;

    const balanceAfter =
      currentBalance -
      paymentAmount;

    const fineBefore =
      currentFine;

    const fineAfter =
      currentFine -
      paymentAmount;

    // ==================================================
    // UPDATE WALLET
    // ==================================================

    await wallet.update(
      {
        balance:
          balanceAfter,

        fine:
          fineAfter,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // CREATE TRANSACTION
    // ==================================================

    await WalletTransaction.create(
      {
        walletType:
          "MEMBER",

        walletId:
          wallet.id,

        type:
          "DEBIT",

        amount:
          paymentAmount,

        balanceBefore,

        balanceAfter,

        description:
          description ||
          "Fine payment",

        referenceType:
          referenceType ||
          "FINE_PAYMENT",

        referenceId:
          referenceId ||
          null,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // COMMIT
    // ==================================================

    await transaction.commit();

    return {
      walletId:
        wallet.id,

      memberId,

      amount:
        paymentAmount,

      balanceBefore,

      balanceAfter,

      fineBefore,

      fineAfter,
    };
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
};

// ======================================================
// GET SUPER ADMIN REVENUE
// ======================================================

const getSuperAdminRevenue = async ({
  superAdminId,
  fromDate,
  toDate,
}) => {
  // ====================================================
  // GET SUPER ADMIN WALLET
  // ====================================================

  const wallet =
    await SuperAdminWallet.findOne({
      where: {
        superAdminId,
      },
    });

  // ====================================================
  // WALLET NOT FOUND
  // ====================================================

  if (!wallet) {
    return {
      totalRevenue: 0,

      transactions: [],
    };
  }

  // ====================================================
  // TRANSACTION FILTER
  // ====================================================

  const where = {
    walletType:
      "SUPER_ADMIN",

    walletId:
      wallet.id,

    type:
      "CREDIT",
  };

  // ====================================================
  // DATE FILTER
  // ====================================================

  if (
    fromDate ||
    toDate
  ) {
    where.createdAt = {};

    if (fromDate) {
      where.createdAt[
        Op.gte
      ] =
        new Date(fromDate);
    }

    if (toDate) {
      where.createdAt[
        Op.lte
      ] =
        new Date(toDate);
    }
  }

  // ====================================================
  // GET TRANSACTIONS
  // ====================================================

  const transactions =
    await WalletTransaction.findAll({
      where,

      order: [
        ["createdAt", "DESC"],
      ],
    });

  // ====================================================
  // TOTAL REVENUE
  // ====================================================

  const totalRevenue =
    transactions.reduce(
      (total, transaction) => {
        return (
          total +
          Number(
            transaction.amount
          )
        );
      },
      0
    );

  // ====================================================
  // RETURN
  // ====================================================

  return {
    totalRevenue,

    transactions,
  };
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getWallet,

  fundMemberWallet,

  transferRentToLibrarian,

  addMoney,

  deductMoney,

  getTransactions,

  addFine,

  payFine,

  getSuperAdminRevenue,
};