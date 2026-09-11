"use client";

import api from "../lib/api";

// Get all categories
export const getCategories = async () => {
  const response = await api.get("/categories");

  return response.data;
};

// Get category by ID
export const getCategoryById = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}`);

  return response.data;
};

// Create category
export const createCategory = async (data) => {
  const response = await api.post("/categories", data);

  return response.data;
};

// Update category
export const updateCategory = async (categoryId, data) => {
  const response = await api.put(
    `/categories/${categoryId}`,
    data
  );

  return response.data;
};

// Delete category
export const deleteCategory = async (categoryId) => {
  const response = await api.delete(
    `/categories/${categoryId}`
  );

  return response.data;
};