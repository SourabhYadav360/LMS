"use strict";

const {sequelize,MemberWallet,Reservation,WalletTransaction,} = require("../../models");

const { redisConnection } = require("../../config/redis");
const { processReservationQueue } = require("../../queue/reservationQueue");

// ======================================================
// FUND MEMBER WALLET
// ======================================================

const fundMemberWallet = async ({librarianId,memberId,amount,description,}) => {
  const fundAmount = Number(amount);

  if (!Number.isFinite(fundAmount) ||fundAmount <= 0) {   // Amount must be a positive number "abc" => NaN, 0, -1, -100
    const error = new Error( "Amount must be greater than 0");
    error.statusCode = 400;
    throw error;
  }

  const transaction =await sequelize.transaction();

  try {
    let memberWallet = await MemberWallet.findOne({
        where: {
          memberId,
        },
        transaction,
        lock:
          transaction.LOCK.UPDATE,
      });

    // ==================================================
    // 5. CREATE MEMBER WALLET IF NOT EXISTS
    // ==================================================

    if (!memberWallet) {
       memberWallet =await MemberWallet.create({
            memberId,
            balance: 0,
            fine: 0,
            fundedByLibrarianId:librarianId,
          },
          {
            transaction,
          }
        );
    }

    // ==================================================
    // 6. OLD BALANCE AND FINE
    // ==================================================

    const balanceBefore = Number(memberWallet.balance);
    const fineBefore = Number(memberWallet.fine);

    // ==================================================
    // 7. INITIAL VALUES
    // ==================================================

    let finePaid = 0;
    let walletAmount = fundAmount;
    let fineAfter = fineBefore;

    if (fineBefore > 0) {
      if (fundAmount >= fineBefore) {
        finePaid = fineBefore;
        fineAfter = 0;
        // Fine ke baad bacha hua amount
        // member wallet balance mein jayega
        walletAmount = fundAmount - fineBefore;
      }

      else {
        finePaid = fundAmount;
        fineAfter = fineBefore - fundAmount;
        walletAmount = 0;
      }
    }

    const balanceAfter =balanceBefore + walletAmount;
    const updateData = {
      balance: balanceAfter,
      fine: fineAfter,
    };

    // ==================================================
    // 8. UPDATE MEMBER WALLET
    // ==================================================

    if (!memberWallet.fundedByLibrarianId) {
      updateData.fundedByLibrarianId = librarianId;
    }
    await memberWallet.update(
      updateData,
      {
        transaction,
      }
    );

    // ==================================================
    // 11. CREATE MEMBER WALLET TRANSACTION
    // ==================================================

    await WalletTransaction.create(
      {
        walletType:"MEMBER",
        walletId:memberWallet.id,
        type:"CREDIT",
        amount:walletAmount,
        balanceBefore,
        balanceAfter,
        description: description ||"Money added by librarian",
        referenceType:"MEMBER_FUNDING",
        referenceId: librarianId,
      },
      {
        transaction,
      }
    );

    // ==================================================
    // 12. COMMIT
    // ==================================================

    await transaction.commit();

    await redisConnection.del("members:all");

    const approvedReservations = await Reservation.findAll({
      where: {
        memberId,
        status: "APPROVED",
      },
      attributes: ["bookId"],
    });

    for (const reservation of approvedReservations) {
      try {
        await processReservationQueue(reservation.bookId);
      } catch (queueError) {
        console.error( "Reservation queue processing failed after member funding:",
          queueError
        );
      }
    }

    // ==================================================
    // 13. RESPONSE
    // ==================================================

    return {
      success: true,
      memberId,
      librarianId,
      fundedAmount: fundAmount,
      finePaid,
      walletAmount,
      memberWallet: {
        balanceBefore,
        balanceAfter,
        fineBefore,
        fineAfter,
      },
    };
  } catch (error) {
       await transaction.rollback();
    throw error;
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  fundMemberWallet,
};