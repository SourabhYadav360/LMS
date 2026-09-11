"use strict";

const {
  Member,
  MemberWallet,
} = require("../../models");

const getMemberReport = async () => {
  const members = await Member.findAll({
    attributes: [
      "id",
      "name",
      "email",
      "status",
      "role",
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

  const totalMembers =
    members.length;

  const activeMembers =
    members.filter(
      (member) =>
        member.status === "ACTIVE"
    ).length;

  const inactiveMembers =
    members.filter(
      (member) =>
        member.status === "INACTIVE"
    ).length;

  const totalBalance =
    members.reduce(
      (total, member) => {
        return (
          total +
          Number(
            member.wallet?.balance || 0
          )
        );
      },
      0
    );

  const totalPendingFine =
    members.reduce(
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

  const membersWithFine =
    members.filter(
      (member) =>
        Number(
          member.wallet?.fine || 0
        ) > 0
    ).length;

  return {
    summary: {
      totalMembers,

      activeMembers,

      inactiveMembers,

      membersWithPendingFine:
        membersWithFine,

      totalWalletBalance:
        totalBalance,

      totalPendingFine,
    },

    members: members.map(
      (member) => ({
        id:
          member.id,

        name:
          member.name,

        email:
          member.email,

        status:
          member.status,

        role:
          member.role,

        wallet: {
          id:
            member.wallet?.id ||
            null,

          balance:
            Number(
              member.wallet?.balance ||
                0
            ),

          fine:
            Number(
              member.wallet?.fine ||
                0
            ),
        },

        createdAt:
          member.createdAt,
      })
    ),
  };
};

module.exports = {
  getMemberReport,
};