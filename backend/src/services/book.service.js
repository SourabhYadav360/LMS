"use strict";

const { Book, Category } = require("../models");

// ======================================================
// GET ALL BOOKS
// ======================================================

const getBooks = async () => {
  return await Book.findAll({
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
    ],

    order: [["createdAt", "DESC"]],
  });
};

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

  if (!book) {
    const error = new Error("Book not found");
    error.statusCode = 404;
    throw error;
  }

  return book;
};

// ======================================================
// CREATE BOOK
// ======================================================

const createBook = async ({
  title,
  author,
  isbn,
  description,
  totalCopies,
  categoryId,
}) => {
  // ----------------------------------------------------
  // REQUIRED FIELDS
  // ----------------------------------------------------

  if (
    !title ||
    !author ||
    !isbn ||
    !categoryId
  ) {
    const error = new Error(
      "Title, author, ISBN and category are required"
    );

    error.statusCode = 400;

    throw error;
  }

  // ----------------------------------------------------
  // NORMALIZE DATA
  // ----------------------------------------------------

  const normalizedTitle = title.trim();

  const normalizedAuthor = author.trim();

  const normalizedIsbn = isbn.trim();

  // ----------------------------------------------------
  // VALIDATE TITLE
  // ----------------------------------------------------

  if (normalizedTitle.length < 2) {
    const error = new Error(
      "Book title must be at least 2 characters"
    );

    error.statusCode = 400;

    throw error;
  }

  // ----------------------------------------------------
  // VALIDATE AUTHOR
  // ----------------------------------------------------

  if (normalizedAuthor.length < 2) {
    const error = new Error(
      "Author name must be at least 2 characters"
    );

    error.statusCode = 400;

    throw error;
  }

  // ----------------------------------------------------
  // VALIDATE ISBN
  // ----------------------------------------------------

  if (normalizedIsbn.length < 5) {
    const error = new Error(
      "Please enter a valid ISBN"
    );

    error.statusCode = 400;

    throw error;
  }

  // ----------------------------------------------------
  // VALIDATE COPIES
  // ----------------------------------------------------

  const copies = Number(totalCopies ?? 1);

  if (
    !Number.isInteger(copies) ||
    copies < 1
  ) {
    const error = new Error(
      "Total copies must be at least 1"
    );

    error.statusCode = 400;

    throw error;
  }

  // ----------------------------------------------------
  // CHECK CATEGORY
  // ----------------------------------------------------

  const category = await Category.findByPk(
    categoryId
  );

  if (!category) {
    const error = new Error(
      "Category not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // ----------------------------------------------------
  // CHECK DUPLICATE ISBN
  // ----------------------------------------------------

  const existingBook = await Book.findOne({
    where: {
      isbn: normalizedIsbn,
    },
  });

  if (existingBook) {
    const error = new Error(
      "Book with this ISBN already exists"
    );

    error.statusCode = 409;

    throw error;
  }

  // ----------------------------------------------------
  // CREATE BOOK
  // ----------------------------------------------------

  const book = await Book.create({
    title: normalizedTitle,

    author: normalizedAuthor,

    isbn: normalizedIsbn,

    description:
      description?.trim() || null,

    totalCopies: copies,

    availableCopies: copies,

    categoryId,

    status: "AVAILABLE",
  });

  // ----------------------------------------------------
  // RETURN CREATED BOOK
  // ----------------------------------------------------

  return await getBookById(book.id);
};

// ======================================================
// UPDATE BOOK
// ======================================================

const updateBook = async (
  bookId,
  data
) => {
  const book = await Book.findByPk(bookId);

  if (!book) {
    const error = new Error(
      "Book not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const updateData = {};

  // ----------------------------------------------------
  // TITLE
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // AUTHOR
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // ISBN
  // ----------------------------------------------------

  if (data.isbn !== undefined) {
    const isbn = data.isbn.trim();

    if (isbn.length < 5) {
      const error = new Error(
        "Please enter a valid ISBN"
      );

      error.statusCode = 400;

      throw error;
    }

    const existingBook =
      await Book.findOne({
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

  // ----------------------------------------------------
  // DESCRIPTION
  // ----------------------------------------------------

  if (data.description !== undefined) {
    updateData.description =
      data.description?.trim() || null;
  }

  // ----------------------------------------------------
  // CATEGORY
  // ----------------------------------------------------

  if (data.categoryId !== undefined) {
    const category =
      await Category.findByPk(
        data.categoryId
      );

    if (!category) {
      const error = new Error(
        "Category not found"
      );

      error.statusCode = 404;

      throw error;
    }

    updateData.categoryId =
      data.categoryId;
  }

  // ----------------------------------------------------
  // TOTAL COPIES
  // ----------------------------------------------------

  if (data.totalCopies !== undefined) {
    const newTotalCopies =
      Number(data.totalCopies);

    if (
      !Number.isInteger(
        newTotalCopies
      ) ||
      newTotalCopies < 1
    ) {
      const error = new Error(
        "Total copies must be at least 1"
      );

      error.statusCode = 400;

      throw error;
    }

    /*
      Currently rented copies =
      totalCopies - availableCopies
    */

    const rentedCopies =
      book.totalCopies -
      book.availableCopies;

    if (newTotalCopies < rentedCopies) {
      const error = new Error(
        `Total copies cannot be less than currently rented copies (${rentedCopies})`
      );

      error.statusCode = 400;

      throw error;
    }

    const newAvailableCopies =
      newTotalCopies - rentedCopies;

    updateData.totalCopies =
      newTotalCopies;

    updateData.availableCopies =
      newAvailableCopies;
  }

  // ----------------------------------------------------
  // AUTO STATUS FROM AVAILABLE COPIES
  // ----------------------------------------------------

  const resolvedAvailableCopies =
    Number(
      updateData.availableCopies ??
        book.availableCopies
    );

  updateData.status =
    resolvedAvailableCopies > 0
      ? "AVAILABLE"
      : "UNAVAILABLE";

  // ----------------------------------------------------
  // UPDATE
  // ----------------------------------------------------

  await book.update(updateData);

  // ----------------------------------------------------
  // RETURN UPDATED BOOK
  // ----------------------------------------------------

  return await getBookById(book.id);
};

// ======================================================
// DELETE BOOK
// ======================================================

const deleteBook = async (bookId) => {
  const book = await Book.findByPk(bookId);

  if (!book) {
    const error = new Error(
      "Book not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // ----------------------------------------------------
  // DON'T DELETE IF BOOK IS RENTED
  // ----------------------------------------------------

  if (
    book.availableCopies <
    book.totalCopies
  ) {
    const error = new Error(
      "Cannot delete a book while copies are rented"
    );

    error.statusCode = 400;

    throw error;
  }

  await book.destroy();

  return {
    id: bookId,
    message: "Book deleted successfully",
  };
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};