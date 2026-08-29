"use strict";

const {
  sequelize,
  Rental,
  LibrarianWallet,
  SuperAdminWallet,
  WalletTransaction,
} = require("../models");

const SETTLEMENT_DELAY = 30 * 60 * 1000;

// ======================================================
// SETTLE ONE RENTAL
// ======================================================

const settleRental = async (rentalId) => {
  const transaction = await sequelize.transaction();

  try {
    // --------------------------------------------------
    // FIND RENTAL
    // --------------------------------------------------

    const rental = await Rental.findByPk(
      rentalId,
      {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }
    );

    if (!rental) {
      throw new Error("Rental not found");
    }

    // --------------------------------------------------
    // ALREADY SETTLED
    // --------------------------------------------------

    if (rental.settlementStatus === "SETTLED") {
      await transaction.commit();

      return {
        success: true,
        message: "Rental already settled",
      };
    }

    // --------------------------------------------------
    // LIBRARIAN ID CHECK
    // --------------------------------------------------

    if (!rental.librarianId) {
      throw new Error(
        "Librarian ID not found in rental"
      );
    }

    // --------------------------------------------------
    // RENTAL AMOUNT
    // --------------------------------------------------

    const amount = Number(
      rental.rentalAmount
    );

    if (amount <= 0) {
      await rental.update(
        {
          settlementStatus: "SETTLED",
          settledAt: new Date(),
        },
        {
          transaction,
        }
      );

      await transaction.commit();

      return {
        success: true,
        amount: 0,
      };
    }

    // --------------------------------------------------
    // LIBRARIAN WALLET
    // --------------------------------------------------

    const librarianWallet =
      await LibrarianWallet.findOne({
        where: {
          librarianId:
            rental.librarianId,
        },

        transaction,

        lock: transaction.LOCK.UPDATE,
      });

    if (!librarianWallet) {
      throw new Error(
        "Librarian wallet not found"
      );
    }

    // --------------------------------------------------
    // SUPER ADMIN WALLET
    // --------------------------------------------------

    // IMPORTANT:
    // Yahan tumhare system ka actual
    // Super Admin ID use hoga.

    const superAdminId =
      rental.superAdminId;

    if (!superAdminId) {
      throw new Error(
        "Super Admin ID not found in rental"
      );
    }

    let superAdminWallet =
      await SuperAdminWallet.findOne({
        where: {
          superAdminId,
        },

        transaction,

        lock: transaction.LOCK.UPDATE,
      });

    if (!superAdminWallet) {
      superAdminWallet =
        await SuperAdminWallet.create(
          {
            superAdminId,
            balance: 0,
          },
          {
            transaction,
          }
        );
    }

    // --------------------------------------------------
    // LIBRARIAN BALANCE
    // --------------------------------------------------

    const librarianBalanceBefore =
      Number(
        librarianWallet.balance
      );

    // Safety check
    if (
      librarianBalanceBefore <
      amount
    ) {
      throw new Error(
        "Librarian wallet has insufficient balance for settlement"
      );
    }

    const librarianBalanceAfter =
      librarianBalanceBefore - amount;

    // --------------------------------------------------
    // SUPER ADMIN BALANCE
    // --------------------------------------------------

    const superAdminBalanceBefore =
      Number(
        superAdminWallet.balance
      );

    const superAdminBalanceAfter =
      superAdminBalanceBefore + amount;

    // --------------------------------------------------
    // LIBRARIAN → 0
    // --------------------------------------------------

    await librarianWallet.update(
      {
        balance:
          librarianBalanceAfter,
      },
      {
        transaction,
      }
    );

    // --------------------------------------------------
    // LIBRARIAN TRANSACTION
    // --------------------------------------------------

    await WalletTransaction.create(
      {
        walletType: "LIBRARIAN",

        walletId:
          librarianWallet.id,

        type: "DEBIT",

        amount,

        balanceBefore:
          librarianBalanceBefore,

        balanceAfter:
          librarianBalanceAfter,

        description:
          "Rental amount settled to Super Admin",

        referenceType:
          "RENTAL_SETTLEMENT",

        referenceId:
          rental.id,
      },
      {
        transaction,
      }
    );

    // --------------------------------------------------
    // SUPER ADMIN CREDIT
    // --------------------------------------------------

    await superAdminWallet.update(
      {
        balance:
          superAdminBalanceAfter,
      },
      {
        transaction,
      }
    );

    // --------------------------------------------------
    // SUPER ADMIN TRANSACTION
    // --------------------------------------------------

    await WalletTransaction.create(
      {
        walletType:
          "SUPER_ADMIN",

        walletId:
          superAdminWallet.id,

        type: "CREDIT",

        amount,

        balanceBefore:
          superAdminBalanceBefore,

        balanceAfter:
          superAdminBalanceAfter,

        description:
          "Rental revenue received from Librarian",

        referenceType:
          "RENTAL_SETTLEMENT",

        referenceId:
          rental.id,
      },
      {
        transaction,
      }
    );

    // --------------------------------------------------
    // MARK RENTAL SETTLED
    // --------------------------------------------------

    await rental.update(
      {
        settlementStatus:
          "SETTLED",

        settledAt:
          new Date(),
      },
      {
        transaction,
      }
    );

    // --------------------------------------------------
    // COMMIT
    // --------------------------------------------------

    await transaction.commit();

    console.log(
      `Rental ${rental.id} settled: ₹${amount}`
    );

    return {
      success: true,
      rentalId: rental.id,
      amount,
    };
  } catch (error) {
    await transaction.rollback();

    console.error(
      `Rental settlement failed for ${rentalId}:`,
      error.message
    );

    throw error;
  }
};

// ======================================================
// SCHEDULE SETTLEMENT
// ======================================================

const scheduleRentalSettlement = (
  rentalId
) => {
  console.log(
    `Rental ${rentalId} settlement scheduled after 30 minutes`
  );

  setTimeout(async () => {
    try {
      await settleRental(rentalId);
    } catch (error) {
      console.error(
        "Settlement worker error:",
        error.message
      );
    }
  }, SETTLEMENT_DELAY);
};

module.exports = {
  settleRental,
  scheduleRentalSettlement,
};