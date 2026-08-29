"use strict";

const bookService = require("../services/book.service");

// ======================================================
// GET ALL BOOKS
// ======================================================

const getBooks = async (req, res) => {
  try {
    const books = await bookService.getBooks();

    return res.status(200).json({
      success: true,
      message: "Books fetched successfully",
      data: {
        books,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Something went wrong",
    });
  }
};

// ======================================================
// GET SINGLE BOOK
// ======================================================

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await bookService.getBookById(id);

    return res.status(200).json({
      success: true,
      message: "Book fetched successfully",
      data: {
        book,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Something went wrong",
    });
  }
};

// ======================================================
// CREATE BOOK
// ======================================================

const createBook = async (req, res) => {
  try {
    const book = await bookService.createBook(
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: {
        book,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Something went wrong",
    });
  }
};

// ======================================================
// UPDATE BOOK
// ======================================================

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await bookService.updateBook(
      id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: {
        book,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Something went wrong",
    });
  }
};

// ======================================================
// DELETE BOOK
// ======================================================

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await bookService.deleteBook(id);

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Something went wrong",
    });
  }
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