"use strict";

const categoryService = require("../services/category.service");

// ======================================================
// GET ALL CATEGORIES
// ======================================================

const getCategories = async (req, res) => {
  try {
    const categories =
      await categoryService.getCategories();

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: {
        categories,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// GET SINGLE CATEGORY
// ======================================================

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category =
      await categoryService.getCategoryById(id);

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// CREATE CATEGORY
// ======================================================

const createCategory = async (req, res) => {
  try {
    const category =
      await categoryService.createCategory(
        req.body
      );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// UPDATE CATEGORY
// ======================================================

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category =
      await categoryService.updateCategory(
        id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// DELETE CATEGORY
// ======================================================

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result =
      await categoryService.deleteCategory(id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};