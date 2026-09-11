"use strict";

const {sequelize,MemberWallet,LibrarianWallet,WalletTransaction,} = require("../../models");

// ======================================================
// TRANSFER RENT
// MEMBER WALLET → LIBRARIAN WALLET
// ======================================================

const transferRentToLibrarian = async ({
  memberId,
  librarianId,
  amount,
  rentalId,
  transaction: externalTransaction = null,
}) => {
  const rentAmount = Number(amount);
  if (!Number.isFinite(rentAmount) ||rentAmount <= 0) {
    const error = new Error( "Rent amount must be greater than 0");
    error.statusCode = 400;
    throw error;
  }
  // ----------------------------------------------------
  // 3. TRANSACTION
  // ----------------------------------------------------
  // Agar bahar se transaction mila hai,
  // wahi use hoga.
  //
  // Agar nahi mila,
  // to naya transaction create hoga.

  const transaction =
externalTransaction ||
    await sequelize.transaction();

  try {
    const memberWallet = await MemberWallet.findOne({
        where: {
          memberId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

    if (!memberWallet) {
      const error = new Error("Member wallet not found");
      error.statusCode = 404;
      throw error;
    }

    // ==================================================
    // 5. MEMBER BALANCE
    // ==================================================

    const memberBalanceBefore =Number(memberWallet.balance);

    if (rentAmount > memberBalanceBefore) {
      const error = new Error("Insufficient wallet balance" );
      error.statusCode = 400;
      throw error;
    }

    // ==================================================
    // 7. GET / CREATE LIBRARIAN WALLET
    // ==================================================

    let librarianWallet = await LibrarianWallet.findOne({
        where: {
          librarianId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

    if (!librarianWallet) {
      librarianWallet = await LibrarianWallet.create(
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
    // 8. MEMBER DEBIT
    // ==================================================

    const memberBalanceAfter = memberBalanceBefore - rentAmount;

    await memberWallet.update(
      {
        balance: memberBalanceAfter,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // 9. MEMBER TRANSACTION
    // ==================================================

    await WalletTransaction.create(
      {
        walletType: "MEMBER",

        walletId: memberWallet.id,

        type: "DEBIT",

        amount: rentAmount,

        balanceBefore: memberBalanceBefore,

        balanceAfter: memberBalanceAfter,

        description: "Book rental payment",

        referenceType: "RENTAL",

        referenceId: rentalId,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // 10. LIBRARIAN CREDIT
    // ==================================================

    const librarianBalanceBefore = Number(librarianWallet.balance);

    const librarianBalanceAfter = librarianBalanceBefore + rentAmount;

    await librarianWallet.update(
      {
        balance: librarianBalanceAfter,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // 11. LIBRARIAN TRANSACTION
    // ==================================================

    await WalletTransaction.create(
      {
        walletType: "LIBRARIAN",

        walletId: librarianWallet.id,

        type: "CREDIT",

        amount: rentAmount,

        balanceBefore:
          librarianBalanceBefore,

        balanceAfter:
          librarianBalanceAfter,

        description:
          "Book rental income",

        referenceType: "RENTAL",

        referenceId: rentalId,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // 12. COMMIT
    // ==================================================

    // Agar transaction bahar se nahi aaya,
    // to yahin commit karo.

    if (!externalTransaction) {
      await transaction.commit();
    }

    // ==================================================
    // 13. RESPONSE
    // ==================================================

    return {
      success: true,

      memberId,

      librarianId,

      rentalId,

      amount: rentAmount,

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
    // Agar transaction humne khud banaya hai,
    // tabhi rollback karenge.

    if (!externalTransaction) {
      await transaction.rollback();
    }

    throw error;
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  transferRentToLibrarian,
};