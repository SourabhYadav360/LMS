"use strict";

const {
  Member,
  MemberWallet,
  Rental,
  Reservation,
} = require("../../models");

const getMemberDashboard = async (memberId) => {
  const member = await Member.findByPk(memberId, {
    attributes: ["id", "name", "email", "status"],
    include: [
      {
        model: MemberWallet,
        as: "wallet",
        attributes: ["id", "balance", "fine"],
        required: false,
      },
    ],
  });

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  const [
    totalRentals,
    activeRentals,
    returnedRentals,
    overdueRentals,
    totalReservations,
    pendingReservations,
    approvedReservations,
  ] = await Promise.all([
    Rental.count({
      where: {
        memberId,
      },
    }),

    Rental.count({
      where: {
        memberId,
        status: "ACTIVE",
      },
    }),

    Rental.count({
      where: {
        memberId,
        status: "RETURNED",
      },
    }),

    Rental.count({
      where: {
        memberId,
        status: "OVERDUE",
      },
    }),

    Reservation.count({
      where: {
        memberId,
      },
    }),

    Reservation.count({
      where: {
        memberId,
        status: "PENDING",
      },
    }),

    Reservation.count({
      where: {
        memberId,
        status: "APPROVED",
      },
    }),
  ]);

  return {
    member: {
      id: member.id,
      name: member.name,
      email: member.email,
      status: member.status,
    },

    wallet: {
      walletId: member.wallet?.id || null,
      balance: Number(member.wallet?.balance || 0),
      pendingFine: Number(member.wallet?.fine || 0),
    },

    rentals: {
      total: totalRentals,
      active: activeRentals,
      returned: returnedRentals,
      overdue: overdueRentals,
    },

    reservations: {
      total: totalReservations,
      pending: pendingReservations,
      approved: approvedReservations,
    },
  };
};

module.exports = {
  getMemberDashboard,
};