"use strict";

const {
  Member,
  MemberWallet,
} = require("../../models");

const getFineReport = async () => {
  const members = await Member.findAll({
    attributes: [
      "id",
      "name",
      "email",
      "status",
      "createdAt",
    ],

    include: [
      {
        model: MemberWallet,
        as: "wallet",
        attributes: [
          "id",
          "balance",
          "fine",
        ],
        required: false,
      },
    ],

    order: [["createdAt", "DESC"]],
  });

  const membersWithFine = members.filter(
    (member) => {
      const fine = member.wallet
        ? Number(member.wallet.fine || 0)
        : 0;

      return fine > 0;
    }
  );

  const totalPendingFine =
    membersWithFine.reduce(
      (total, member) => {
        return (
          total +
          Number(
            member.wallet?.fine || 0
          )
        );
      },
      0
    );

  return {
    summary: {
      totalMembers: members.length,

      membersWithPendingFine:
        membersWithFine.length,

      totalPendingFine,
    },

    fines: members.map(
      (member) => ({
        memberId: member.id,

        memberName:
          member.name,

        email:
          member.email,

        memberStatus:
          member.status,

        walletId:
          member.wallet?.id || null,

        balance:
          Number(
            member.wallet?.balance || 0
          ),

        pendingFine:
          Number(
            member.wallet?.fine || 0
          ),

        createdAt:
          member.createdAt,
      })
    ),
  };
};

module.exports = {
  getFineReport,
};