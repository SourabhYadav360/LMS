"use strict";

require("dotenv").config();

const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Database connection
    await sequelize.authenticate();

    console.log("Database connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Unable to start server:",
      error
    );

    process.exit(1);
  }
};

startServer();