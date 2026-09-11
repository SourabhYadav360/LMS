"use strict";

const {
  getCategories,
} = require("./getCategories.service");

const {
  getCategoryById,
} = require("./getCategoryById.service");

const {
  createCategory,
} = require("./createCategory.service");

const {
  updateCategory,
} = require("./updateCategory.service");

const {
  deleteCategory,
} = require("./deleteCategory.service");

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};