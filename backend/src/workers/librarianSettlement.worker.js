"use strict";

const { Worker } = require("bullmq");

const { redisConnection,} = require("../config/redis");

const {settleLibrarianWallet,} = require("../services/wallet/settleLibrarianWallet.service");

// ======================================================
// LIBRARIAN SETTLEMENT WORKER
// ======================================================

const librarianSettlementWorker = new Worker(
  "librarian-settlement",

  async (job) => {
    console.log(`Processing settlement job: ${job.name}`);
    const result = await settleLibrarianWallet();
    console.log("Settlement completed:",result);
    return result;
  },

  {
    connection: redisConnection,
  }
);

// ======================================================
// JOB COMPLETED
// ======================================================

librarianSettlementWorker.on(
  "completed",
  (job) => {
    console.log(
      `Settlement job ${job.id} completed.`
    );
  }
);

// ======================================================
// JOB FAILED
// ======================================================

librarianSettlementWorker.on(
  "failed",
  (job, error) => {
    console.error(
      `Settlement job ${job?.id} failed:`,
      error.message
    );
  }
);

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  librarianSettlementWorker,
};