"use strict";

const {sequelize,SuperAdmin,LibrarianWallet,SuperAdminWallet,WalletTransaction,} = require("../../models");

// ======================================================
// SETTLE ALL LIBRARIAN WALLETS
// ======================================================

const settleLibrarianWallet = async () => {
  const transaction =await sequelize.transaction();

  try {
    
    const superAdmin = await SuperAdmin.findOne({
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

    if (!superAdmin) {
      const error = new Error("Super Admin not found");
      error.statusCode = 404;
      throw error;
    }

    const superAdminId =superAdmin.id;

    let superAdminWallet = await SuperAdminWallet.findOne({
        where: {
          superAdminId,
        },
        transaction,
        lock:transaction.LOCK.UPDATE,
      });

    if (!superAdminWallet) {
      superAdminWallet =await SuperAdminWallet.create(
          {
            superAdminId,
            balance: 0,
          },
          {
            transaction,
          }
        );
    }

    // ==================================================
    // GET ALL LIBRARIAN WALLETS
    // ==================================================

    const librarianWallets = await LibrarianWallet.findAll({
        transaction,
        lock:transaction.LOCK.UPDATE,
      });

    // ==================================================
    // NO LIBRARIAN WALLETS
    // ==================================================

    if (librarianWallets.length === 0) {
      await transaction.commit();

      return {
        success: true,
        processedLibrarians: 0,
        totalTransferred: 0,
        message:"No librarian wallets found",
      };
    }

    // ==================================================
    // COUNTERS
    // ==================================================

    let processedLibrarians = 0;

    let totalTransferred = 0;

    // ==================================================
    // PROCESS EACH LIBRARIAN WALLET
    // ==================================================

    for ( const librarianWallet of librarianWallets) {
       const librarianBalance =Number(librarianWallet.balance);

      // =================================================
      // SKIP ZERO / NEGATIVE BALANCE
      // =================================================

      if (librarianBalance <= 0) {
        continue;
      }

      // =================================================
      // LIBRARIAN BALANCE BEFORE / AFTER
      // =================================================

      const librarianBalanceBefore =librarianBalance;

      const librarianBalanceAfter =0;

      // =================================================
      // SUPER ADMIN BALANCE BEFORE / AFTER
      // =================================================

      const superAdminBalanceBefore =Number(superAdminWallet.balance);

      const superAdminBalanceAfter =superAdminBalanceBefore + librarianBalance;

      // =================================================
      // UPDATE LIBRARIAN WALLET
      // =================================================

      await librarianWallet.update(
        {
          balance: librarianBalanceAfter,
        },

        {
          transaction,
        }
      );

      // =================================================
      // UPDATE SUPER ADMIN WALLET
      // =================================================

      await superAdminWallet.update(
        {
          balance: superAdminBalanceAfter,
        },

        {
          transaction,
        }
      );

      // =================================================
      // LIBRARIAN DEBIT TRANSACTION
      // =================================================

      await WalletTransaction.create(
        {
          walletType: "LIBRARIAN",
          walletId:librarianWallet.id,
          type:"DEBIT",
          amount:librarianBalance,
          balanceBefore:librarianBalanceBefore,
          balanceAfter:librarianBalanceAfter,
          description:"Scheduled settlement to Super Admin",
          referenceType:"LIBRARIAN_SETTLEMENT",
          referenceId: superAdminWallet.id,
        },
        {
          transaction,
        }
      );

      // =================================================
      // SUPER ADMIN CREDIT TRANSACTION
      // =================================================

      await WalletTransaction.create(
        {
          walletType:"SUPER_ADMIN",
          walletId:superAdminWallet.id,
          type: "CREDIT",
          amount:librarianBalance,
          balanceBefore:superAdminBalanceBefore,
          balanceAfter: superAdminBalanceAfter,
          description:"Scheduled settlement received from Librarian",
          referenceType:"LIBRARIAN_SETTLEMENT",
          referenceId:librarianWallet.id,
        },
        {
          transaction,
        }
      );

      // =================================================
      // UPDATE COUNTERS
      // =================================================

      processedLibrarians++;

      totalTransferred +=librarianBalance;
    }

    // ==================================================
    // COMMIT
    // ==================================================

    await transaction.commit();

    // ==================================================
    // RETURN RESULT
    // ==================================================

    return {
      success: true,
      processedLibrarians,
      totalTransferred,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  settleLibrarianWallet,
};