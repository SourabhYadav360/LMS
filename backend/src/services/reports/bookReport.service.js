"use strict";

const {
  Book,
  Category,
} = require("../../models");

const getBookReport = async () => {
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

  const totalBooks = books.length;

  const totalCopies = books.reduce(
    (total, book) =>
      total + Number(book.totalCopies || 0),
    0
  );

  const availableCopies = books.reduce(
    (total, book) =>
      total + Number(book.availableCopies || 0),
    0
  );

  const rentedCopies =
    totalCopies - availableCopies;

  const availableBooks = books.filter(
    (book) =>
      book.status === "AVAILABLE"
  ).length;

  const unavailableBooks = books.filter(
    (book) =>
      book.status === "UNAVAILABLE"
  ).length;

  return {
    summary: {
      totalBooks,
      totalCopies,
      availableCopies,
      rentedCopies,
      availableBooks,
      unavailableBooks,
    },

    books: books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,

      category: book.category
        ? book.category.name
        : null,

      totalCopies:
        Number(book.totalCopies),

      availableCopies:
        Number(book.availableCopies),

      rentedCopies:
        Number(book.totalCopies) -
        Number(book.availableCopies),

      status: book.status,

      createdAt: book.createdAt,
    })),
  };
};

module.exports = {
  getBookReport,
};