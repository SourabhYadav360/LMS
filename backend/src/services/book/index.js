"use strict";

const {
  getBooks,
} = require("./getBooks.service");

const {
  getBookById,
} = require("./getBookById.service");

const {
  createBook,
} = require("./createBook.service");

const {
  updateBook,
} = require("./updateBook.service");

const {
  deleteBook,
} = require("./deleteBook.service");

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};