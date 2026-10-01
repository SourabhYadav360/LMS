require("dotenv").config();

const { Sequelize } = require("sequelize");

const connectionOptions = {
  dialect: "postgres",
  logging: false,
};

if (
  process.env.DATABASE_URL &&
  process.env.NODE_ENV === "production"
) {
  connectionOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, connectionOptions)
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        ...connectionOptions,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
      }
    );

module.exports = sequelize;