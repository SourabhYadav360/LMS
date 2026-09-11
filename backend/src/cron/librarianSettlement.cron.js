// "use strict";

// const cron = require("node-cron");

// const {
//   settleLibrarianWallet,
// } = require("../services/wallet/settleLibrarianWallet.service");

// // Every 30 minutes
// cron.schedule("*/1 * * * *", async () => {
//   console.log("Starting librarian settlement...");

//   try {
//     const result = await settleLibrarianWallet();

//     console.log(
//       "Settlement completed:",
//       result
//     );
//   } catch (error) {
//     console.error(
//       "Settlement failed:",
//       error.message
//     );
//   }
// });

// console.log(
//   "Librarian settlement cron started..."
// );