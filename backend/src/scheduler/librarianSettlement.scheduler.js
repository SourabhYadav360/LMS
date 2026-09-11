"use strict";

const {librarianSettlementQueue,} = require("../queue/librarianSettlement.queue");

const setupLibrarianSettlementScheduler =async () => {
    await librarianSettlementQueue.upsertJobScheduler(
      "daily-librarian-settlement", // Job name
      {
        pattern: "* * * * *",
        // pattern: "0 1 * * *",
        tz: "Asia/Kolkata",
      },
      {
        name: "settle-librarian-wallet",

        data: {},

        opts: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        },
      }
    );

    console.log("Librarian settlement scheduler configured.");
  };

module.exports = {
  setupLibrarianSettlementScheduler,
};    

// Librarian settlement ka job automatically ek fixed time/pattern par queue me create karwana.