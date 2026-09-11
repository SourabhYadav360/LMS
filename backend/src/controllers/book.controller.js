"use strict";

const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require("../services/book");

// ======================================================
// GET ALL BOOKS
// ======================================================

const getAll = async (req, res, next) => {
  try {
    const result = await getBooks();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET BOOK BY ID
// ======================================================

const getById = async (req, res, next) => {
  try {
    const bookId =
      req.params.bookId ||
      req.params.id;

    const result = await getBookById(bookId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// CREATE BOOK
// ======================================================

const create = async (req, res, next) => {
  try {
    const {
      title,
      author,
      isbn,
      description,
      totalCopies,
      categoryId,
    } = req.body;

    const result = await createBook({
      title,
      author,
      isbn,
      description,
      totalCopies,
      categoryId,
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE BOOK
// ======================================================

const update = async (req, res, next) => {
  try {
    const bookId =
      req.params.bookId ||
      req.params.id;

    const result = await updateBook(
      bookId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// DELETE BOOK
// ======================================================

const remove = async (req, res, next) => {
  try {
    const bookId =
      req.params.bookId ||
      req.params.id;

    const result = await deleteBook(bookId);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};