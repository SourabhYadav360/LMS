"use strict";

const { Category } = require("../../models");

const getCategoryById = async (categoryId) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    const error = new Error("Category not found");

    error.statusCode = 404;

    throw error;
  }

  return category;
};

module.exports = {
  getCategoryById,
};