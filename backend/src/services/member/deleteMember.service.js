"use strict";

const {Member,Rental,} = require("../../models");

const {redisConnection,} = require("../../config/redis");

const deleteMember = async (memberId) => {
  
  const member = await Member.findByPk(memberId);

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  // CHECK ACTIVE RENTALS
  const activeRentals = await Rental.count({
    where: {
      memberId,
      status: "ACTIVE",
    },
  });

  if (activeRentals > 0) {
    const error = new Error(
      "Cannot delete member with active rentals"
    );

    error.statusCode = 400;
    throw error;
  }

  await member.destroy();

  await redisConnection.del("members:all");

  return {
    id: memberId,
    message: "Member deleted successfully",
  };
};

module.exports = {
  deleteMember,
};