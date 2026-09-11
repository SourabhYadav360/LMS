"use strict";

const { Category } = require("../../models");

const createCategory = async ({
  name,
  description,
}) => {
  // Required validation
  if (!name) {
    const error = new Error(
      "Category name is required"
    );

    error.statusCode = 400;

    throw error;
  }

  // Normalize data
  const normalizedName = name.trim();

  const normalizedDescription =
    description?.trim() || null;

  // Name validation
  if (normalizedName.length < 2) {
    const error = new Error(
      "Category name must be at least 2 characters"
    );

    error.statusCode = 400;

    throw error;
  }

  // Duplicate category check
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

  // Create category
  const category = await Category.create({
    name: normalizedName,
    description: normalizedDescription,
  });

  return category;
};

module.exports = {
  createCategory,
};