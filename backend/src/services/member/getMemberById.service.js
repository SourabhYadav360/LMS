"use strict";

const {
  Member,
  MemberWallet,
  Rental,
  Reservation,
} = require("../../models");

const getMemberById = async (memberId) => {
  const member = await Member.findByPk(memberId, {
    attributes: {
      exclude: ["password"],
    },

    include: [
      {
        model: MemberWallet,
        as: "wallet",
      },
      {
        model: Rental,
        as: "rentals",
      },
      {
        model: Reservation,
        as: "reservations",
      },
    ],
  });

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  return member;
};

module.exports = {
  getMemberById,
};