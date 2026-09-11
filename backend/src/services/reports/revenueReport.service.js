"use strict";

const {
  SuperAdminWallet,
  WalletTransaction,
} = require("../../models");

const { Op } = require("sequelize");

const getRevenueReport = async ({
  fromDate,
  toDate,
} = {}) => {
  const where = {
    walletType: "SUPER_ADMIN",
    type: "CREDIT",
    referenceType:
      "LIBRARIAN_SETTLEMENT",
  };

  if (fromDate || toDate) {
    where.createdAt = {};

    if (fromDate) {
      where.createdAt[Op.gte] =
        new Date(fromDate);
    }

    if (toDate) {
      where.createdAt[Op.lte] =
        new Date(toDate);
    }
  }

  const transactions =
    await WalletTransaction.findAll({
      where,

      order: [
        ["createdAt", "DESC"],
      ],
    });

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

  const superAdminWallet =
    await SuperAdminWallet.findOne({
      order: [["id", "ASC"]],
    });

  const currentBalance =
    superAdminWallet
      ? Number(
          superAdminWallet.balance || 0
        )
      : 0;

  return {
    summary: {
      totalRevenue,

      totalTransactions:
        transactions.length,

      currentSuperAdminBalance:
        currentBalance,
    },

    transactions:
      transactions.map(
        (transaction) => ({
          id:
            transaction.id,

          walletId:
            transaction.walletId,

          type:
            transaction.type,

          amount:
            Number(
              transaction.amount || 0
            ),

          balanceBefore:
            Number(
              transaction.balanceBefore ||
                0
            ),

          balanceAfter:
            Number(
              transaction.balanceAfter ||
                0
            ),

          description:
            transaction.description,

          referenceType:
            transaction.referenceType,

          referenceId:
            transaction.referenceId,

          createdAt:
            transaction.createdAt,
        })
      ),
  };
};

module.exports = {
  getRevenueReport,
};