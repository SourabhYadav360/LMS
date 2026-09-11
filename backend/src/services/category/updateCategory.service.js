"use strict";

const { Category } = require("../../models");

const updateCategory = async (
  categoryId,
  { name, description }
) => {
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

  const updateData = {};

  // Update name
  if (name !== undefined) {
    const normalizedName = name.trim();

    if (normalizedName.length < 2) {
      const error = new Error(
        "Category name must be at least 2 characters"
      );

      error.statusCode = 400;

      throw error;
    }

    // Duplicate name check
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

  // Update description
  if (description !== undefined) {
    updateData.description =
      description?.trim() || null;
  }

  // Update category
  await category.update(updateData);

  return category;
};

module.exports = {
  updateCategory,
};