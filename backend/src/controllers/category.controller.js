"use strict";

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../services/category");

// ======================================================
// GET ALL CATEGORIES
// ======================================================

const getAll = async (req, res, next) => {
  try {
    const result = await getCategories();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET CATEGORY BY ID
// ======================================================

const getById = async (req, res, next) => {
  try {
    const categoryId =
      req.params.categoryId ||
      req.params.id;

    const result = await getCategoryById(
      categoryId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// CREATE CATEGORY
// ======================================================

const create = async (req, res, next) => {
  try {
    const {
      name,
      description,
    } = req.body;

    const result = await createCategory({
      name,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE CATEGORY
// ======================================================

const update = async (req, res, next) => {
  try {
    const categoryId =
      req.params.categoryId ||
      req.params.id;

    const result = await updateCategory(
      categoryId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// DELETE CATEGORY
// ======================================================

const remove = async (req, res, next) => {
  try {
    const categoryId =
      req.params.categoryId ||
      req.params.id;

    const result = await deleteCategory(
      categoryId
    );

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