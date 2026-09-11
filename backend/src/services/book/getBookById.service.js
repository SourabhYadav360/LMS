"use strict";

const {
  Book,
  Category,
} = require("../../models");

// ======================================================
// GET SINGLE BOOK
// ======================================================

const getBookById = async (bookId) => {
  const book = await Book.findByPk(bookId, {
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
    ],
  });

  // ----------------------------------------------------
  // BOOK NOT FOUND
  // ----------------------------------------------------

  if (!book) {
    const error = new Error(
      "Book not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // ----------------------------------------------------
  // RETURN BOOK
  // ----------------------------------------------------

  return book;
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getBookById,
};