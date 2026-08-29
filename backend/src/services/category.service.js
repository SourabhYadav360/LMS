"use strict";

const { Category } = require("../models");

// ======================================================
// GET ALL CATEGORIES
// ======================================================

const getCategories = async () => {
  return await Category.findAll({
    order: [["createdAt", "DESC"]],
  });
};

// ======================================================
// GET SINGLE CATEGORY
// ======================================================

const getCategoryById = async (categoryId) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return category;
};

// ======================================================
// CREATE CATEGORY
// ======================================================

const createCategory = async ({ name, description }) => {
  // --------------------------------------------------
  // REQUIRED VALIDATION
  // --------------------------------------------------

  if (!name) {
    const error = new Error(
      "Category name is required"
    );

    error.statusCode = 400;
    throw error;
  }

  // --------------------------------------------------
  // NORMALIZE DATA
  // --------------------------------------------------

  const normalizedName = name.trim();

  const normalizedDescription =
    description?.trim() || null;

  // --------------------------------------------------
  // NAME VALIDATION
  // --------------------------------------------------

  if (normalizedName.length < 2) {
    const error = new Error(
      "Category name must be at least 2 characters"
    );

    error.statusCode = 400;
    throw error;
  }

  // --------------------------------------------------
  // DUPLICATE CATEGORY CHECK
  // --------------------------------------------------

  const existingCategory =
    await Category.findOne({
      where: {
        name: normalizedName,
      },
    });

  if (existingCategory) {
    const error = new Error(
      "Category with this name already exists"
    );

    error.statusCode = 409;
    throw error;
  }

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------

  const category = await Category.create({
    name: normalizedName,
    description: normalizedDescription,
  });

  return category;
};

// ======================================================
// UPDATE CATEGORY
// ======================================================

const updateCategory = async (
  categoryId,
  { name, description }
) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    const error = new Error("Category not found");

    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  // --------------------------------------------------
  // NAME
  // --------------------------------------------------

  if (name !== undefined) {
    const normalizedName = name.trim();

    if (normalizedName.length < 2) {
      const error = new Error(
        "Category name must be at least 2 characters"
      );

      error.statusCode = 400;
      throw error;
    }

    // Check duplicate name
    const existingCategory =
      await Category.findOne({
        where: {
          name: normalizedName,
        },
      });

    if (
      existingCategory &&
      existingCategory.id !== category.id
    ) {
      const error = new Error(
        "Category with this name already exists"
      );

      error.statusCode = 409;
      throw error;
    }

    updateData.name = normalizedName;
  }

  // --------------------------------------------------
  // DESCRIPTION
  // --------------------------------------------------

  if (description !== undefined) {
    updateData.description =
      description?.trim() || null;
  }

  // --------------------------------------------------
  // UPDATE
  // --------------------------------------------------

  await category.update(updateData);

  return category;
};

// ======================================================
// DELETE CATEGORY
// ======================================================

const deleteCategory = async (categoryId) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    const error = new Error("Category not found");

    error.statusCode = 404;
    throw error;
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  await category.destroy();

  return {
    id: categoryId,
  };
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