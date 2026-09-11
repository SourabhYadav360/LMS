"use strict";

require("dotenv").config();

const app = require("./app");

const {
  sequelize,
} = require("./models");

// ======================================================
// REDIS CONNECTION
// ======================================================

// Redis automatically connect ho jayega
// jab redis config file require hogi.

require("./config/redis");

// ======================================================
// LIBRARIAN SETTLEMENT CRON
// ======================================================

// Cron automatically runs librarian
// wallet settlement every 30 minutes.

const {
  setupLibrarianSettlementScheduler,
} = require(
  "./scheduler/librarianSettlement.scheduler"
);

require(
  "./workers/librarianSettlement.worker"
);

// require(
//   "./cron/librarianSettlement.cron"
// );

// ======================================================
// PORT
// ======================================================
    

const PORT =
  process.env.PORT || 5000;

// ======================================================
// START SERVER
// ======================================================

const startServer = async () => {
  try {
    // --------------------------------------------------
    // DATABASE CONNECTION
    // --------------------------------------------------

    await sequelize.authenticate();

    console.log(
      "Database connected successfully"
    );

    // --------------------------------------------------
    // START EXPRESS SERVER
    // --------------------------------------------------
    await setupLibrarianSettlementScheduler();
    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Unable to start server:",
      error
    );

    process.exit(1);
  }
};

// ======================================================
// RUN SERVER
// ======================================================

startServer();