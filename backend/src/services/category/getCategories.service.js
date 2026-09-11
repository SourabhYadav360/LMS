"use strict";

const { Category } = require("../../models");

const getCategories = async () => {
  const categories = await Category.findAll({
    order: [["createdAt", "DESC"]],
  });

  return categories;
};

module.exports = {
  getCategories,
};