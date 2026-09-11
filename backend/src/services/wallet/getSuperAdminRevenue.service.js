"use strict";

const {SuperAdminWallet,WalletTransaction,} = require("../../models");

const { Op } = require("sequelize");

// ======================================================
// GET SUPER ADMIN REVENUE
// ======================================================

const getSuperAdminRevenue = async ({
  superAdminId,
  fromDate,
  toDate,
}) => {
  try {
    // ====================================================
    // 1. GET SUPER ADMIN WALLET
    // ====================================================

    const wallet = await SuperAdminWallet.findOne({
        where: {
          superAdminId,
        },
      });

    // ====================================================
    // 2. WALLET NOT FOUND
    // ====================================================

    if (!wallet) {
      return {
        superAdminId,
        walletId: null,
        totalRevenue: 0,
        totalDebit: 0,
        transactionCount: 0,
        transactions: [],
      };
    }

    // ====================================================
    // 3. TRANSACTION FILTER
    // ====================================================

    const where = {
      walletType: "SUPER_ADMIN",
      walletId: wallet.id,

      // Super Admin ko settlement ke time
      // CREDIT milta hai
      type: "CREDIT",

      // IMPORTANT:
      // Settlement service me bhi
      // LIBRARIAN_SETTLEMENT use ho raha hai
      referenceType: "LIBRARIAN_SETTLEMENT",
    };

    // ====================================================
    // 4. DATE FILTER
    // ====================================================

    if (fromDate || toDate) {
      where.createdAt = {};

      if (fromDate) {
        const startDate = new Date(fromDate);

        startDate.setHours(0,0,0,0);
        

        where.createdAt[Op.gte] =startDate;}

      if (toDate) {const endDate = new Date(toDate);

        endDate.setHours( 23,59,59,999);

        where.createdAt[Op.lte] =endDate;
      }
    }

    // ====================================================
    // 5. GET REVENUE TRANSACTIONS
    // ====================================================

    const transactions =await WalletTransaction.findAll({
        where,

        order: [
          ["createdAt", "DESC"],
        ],
      });

    // ====================================================
    // 6. CALCULATE TOTAL REVENUE
    // ====================================================

    const totalRevenue =
      transactions.reduce(
        (total, transaction) => {
          return (
            total +
            Number(
              transaction.amount || 0
            )
          );
        },
        0
      );

    // ====================================================
    // 7. RETURN
    // ====================================================

    return {
      superAdminId,

      walletId: wallet.id,

      totalRevenue,

      totalDebit: 0,

      transactionCount:
        transactions.length,

      transactions,
    };
  } catch (error) {
    console.error(
      "GET SUPER ADMIN REVENUE ERROR:",
      error
    );

    throw error;
  }
};


module.exports = {
  getSuperAdminRevenue,
};