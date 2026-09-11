"use strict";

const { Reservation,} = require("../../models");

const {Op,} = require("sequelize");

const expireReservations =async () => {
    const now = new Date();

    const [updatedCount] = await Reservation.update(
        {
          status: "EXPIRED",
        },
        {
          where: {
            status: {
              [Op.in]: [
                "PENDING",
                "APPROVED",
              ],
            },
            expiresAt: {
              [Op.lt]: now,
            },
          },
        }
      );

    return {
      updatedCount,
    };
  };

module.exports = {
  expireReservations,
};