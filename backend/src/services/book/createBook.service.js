"use strict";

const {Book,Category,} = require("../../models");

const {getBookById,} = require("./getBookById.service");

const {redisConnection,} = require("../../config/redis");

const createBook = async ({
  title,
  author,
  isbn,
  description,
  totalCopies,
  categoryId,
}) => {

  if (!title || !author || !isbn || !categoryId) {
    const error = new Error("Title, author, ISBN and category are required");
    error.statusCode = 400;
    throw error;
  }
  const normalizedTitle = title.trim();
  const normalizedAuthor = author.trim();
  const normalizedIsbn = isbn.trim();

  if (normalizedTitle.length < 2) {
    const error = new Error("Book title must be at least 2 characters");
    error.statusCode = 400;
    throw error;
  }

  if (normalizedAuthor.length < 2) {
    const error = new Error( "Author name must be at least 2 characters");
    error.statusCode = 400;
    throw error;
  }

  if (normalizedIsbn.length < 5) {
    const error = new Error("Please enter a valid ISBN");
     error.statusCode = 400;
     throw error;
  }

  const copies = Number(totalCopies ?? 1);

  if (!Number.isInteger(copies) ||copies < 1) {
    const error = new Error("Total copies must be at least 1");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findByPk(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  // CHECK DUPLICATE ISBN
  const existingBook = await Book.findOne({
    where: {
      isbn: normalizedIsbn,
    },
  });

  if (existingBook) {
    const error = new Error("Book with this ISBN already exists");
    error.statusCode = 409;
    throw error;
  }

  const book = await Book.create({
    title: normalizedTitle,
    author: normalizedAuthor,
    isbn: normalizedIsbn,
    description:description?.trim() || null,
    totalCopies: copies,
    availableCopies: copies,
    categoryId,
    status: "AVAILABLE",
  });

  await redisConnection.del("books:all");
  return await getBookById(book.id);
};

module.exports = {
  createBook,
};