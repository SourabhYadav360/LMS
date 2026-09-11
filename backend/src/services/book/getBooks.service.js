"use strict";

const {
  Book,
  Category,
} = require("../../models");

const {
  redisConnection,
} = require("../../config/redis");

const getBooks = async () => {


  const cachedBooks = await redisConnection.get("books:all");

  if (cachedBooks) {
    console.log("Books fetched from Redis");

    return JSON.parse(cachedBooks);
  }
  console.log( "Books fetched from PostgreSQL");

  const books = await Book.findAll({
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
    ],

    order: [["createdAt", "DESC"]],
  });

  await redisConnection.set(
    "books:all",
    JSON.stringify(books),
    "EX",
    300
  );
 return books;
};

module.exports = {
  getBooks,
};