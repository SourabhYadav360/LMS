"use strict";

const {
  Book,
  Category,
} = require("../../models");

const {
  getBookById,
} = require("./getBookById.service");

const {
  redisConnection,
} = require("../../config/redis");

const updateBook = async (bookId, data) => {
  // FIND BOOK
  const book = await Book.findByPk(bookId);

  if (!book) {
    const error = new Error("Book not found");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  // UPDATE TITLE
  if (data.title !== undefined) {
    const title = data.title.trim();

    if (title.length < 2) {
      const error = new Error(
        "Book title must be at least 2 characters"
      );

      error.statusCode = 400;
      throw error;
    }

    updateData.title = title;
  }

  // UPDATE AUTHOR
  if (data.author !== undefined) {
    const author = data.author.trim();

    if (author.length < 2) {
      const error = new Error(
        "Author name must be at least 2 characters"
      );

      error.statusCode = 400;
      throw error;
    }

    updateData.author = author;
  }

  // UPDATE ISBN
  if (data.isbn !== undefined) {
    const isbn = data.isbn.trim();

    if (isbn.length < 5) {
      const error = new Error(
        "Please enter a valid ISBN"
      );

      error.statusCode = 400;
      throw error;
    }

    const existingBook = await Book.findOne({
      where: {
        isbn,
      },
    });

    if (
      existingBook &&
      existingBook.id !== book.id
    ) {
      const error = new Error(
        "Book with this ISBN already exists"
      );

      error.statusCode = 409;
      throw error;
    }

    updateData.isbn = isbn;
  }

  // UPDATE DESCRIPTION
  if (data.description !== undefined) {
    updateData.description =
      data.description?.trim() || null;
  }

  // UPDATE CATEGORY
  if (data.categoryId !== undefined) {
    const category = await Category.findByPk(
      data.categoryId
    );

    if (!category) {
      const error = new Error(
        "Category not found"
      );

      error.statusCode = 404;
      throw error;
    }

    updateData.categoryId = data.categoryId;
  }

  // UPDATE TOTAL COPIES
  if (data.totalCopies !== undefined) {
    const newTotalCopies = Number(
      data.totalCopies
    );

    if (
      !Number.isInteger(newTotalCopies) ||
      newTotalCopies < 1
    ) {
      const error = new Error(
        "Total copies must be at least 1"
      );

      error.statusCode = 400;
      throw error;
    }

    // Currently rented copies
    const rentedCopies =
      book.totalCopies -
      book.availableCopies;

    // Cannot reduce total copies
    // below currently rented copies
    if (newTotalCopies < rentedCopies) {
      const error = new Error(
        `Total copies cannot be less than currently rented copies (${rentedCopies})`
      );

      error.statusCode = 400;
      throw error;
    }

    // Calculate new available copies
    const newAvailableCopies =
      newTotalCopies - rentedCopies;

    updateData.totalCopies =
      newTotalCopies;

    updateData.availableCopies =
      newAvailableCopies;
  }

  // UPDATE STATUS
  const resolvedAvailableCopies =
    Number(
      updateData.availableCopies ??
        book.availableCopies
    );

  updateData.status =
    resolvedAvailableCopies > 0
      ? "AVAILABLE"
      : "UNAVAILABLE";

  // SAVE BOOK
  await book.update(updateData);

  // DELETE OLD BOOKS CACHE
  await redisConnection.del("books:all");

  // GET UPDATED BOOK WITH CATEGORY
  return await getBookById(book.id);
};

module.exports = {
  updateBook,
};