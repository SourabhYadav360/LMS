"use strict";

const {
  Queue,
} = require("bullmq");

const {
  redisConnection,
} = require("./redis");

const RENTAL_SETTLEMENT_DELAY =
  30 * 60 * 1000;

// ======================================================
// QUEUE
// ======================================================

const rentalSettlementQueue =
  new Queue(
    "rental-settlement",
    {
      connection:
        redisConnection,
    }
  );

// ======================================================
// ADD SETTLEMENT JOB
// ======================================================

const scheduleRentalSettlement =
  async (rentalId) => {
    await rentalSettlementQueue.add(
      "settle-rental",
      {
        rentalId,
      },
      {
        delay:
          RENTAL_SETTLEMENT_DELAY,

        removeOnComplete: true,

        removeOnFail: false,

        attempts: 3,

        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );
  };

module.exports = {
  rentalSettlementQueue,

  scheduleRentalSettlement,
};