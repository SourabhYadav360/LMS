"use strict";

const { Book } = require("../../models");
const { redisConnection } = require("../../config/redis");

const deleteBook = async (bookId) => {
  const book = await Book.findByPk(bookId);

  if (!book) {
    const error = new Error("Book not found");
    error.statusCode = 404;
    throw error;
  }

  if (book.availableCopies < book.totalCopies) {
    const error = new Error("Cannot delete a book while copies are rented");
    error.statusCode = 400;
    throw error;
  }

  await book.destroy();

  await redisConnection.del("books:all");

  return {
    id: bookId,
    message: "Book deleted successfully",
  };
};

module.exports = {
  deleteBook,
};