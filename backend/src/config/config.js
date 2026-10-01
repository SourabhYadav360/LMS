require("dotenv").config();

const databaseConfig = (databaseName) => {
  if (process.env.DATABASE_URL) {
    return {
      use_env_variable: "DATABASE_URL",
      dialect: "postgres",
      ...(process.env.NODE_ENV === "production" && {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      }),
    };
  }

  return {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: databaseName,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
  };
};

module.exports = {
  development: databaseConfig(process.env.DB_NAME),
  test: databaseConfig(`${process.env.DB_NAME}_test`),
  production: databaseConfig(process.env.DB_NAME),
};