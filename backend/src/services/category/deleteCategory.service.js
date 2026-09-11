"use strict";

const { Category } = require("../../models");

const deleteCategory = async (categoryId) => {
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

  await category.destroy();

  return {
    id: categoryId,
    message: "Category deleted successfully",
  };
};

module.exports = {
  deleteCategory,
};