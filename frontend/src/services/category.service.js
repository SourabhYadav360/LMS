import api from "@/lib/api";

// ======================================================
// GET ALL CATEGORIES
// ======================================================

export const getCategories = async () => {
  return await api("/categories", {
    method: "GET",
  });
};

// ======================================================
// GET CATEGORY BY ID
// ======================================================

export const getCategoryById = async (id) => {
  return await api(`/categories/${id}`, {
    method: "GET",
  });
};

// ======================================================
// CREATE CATEGORY
// ======================================================

export const createCategory = async (data) => {
  return await api("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// ======================================================
// UPDATE CATEGORY
// ======================================================

export const updateCategory = async (id, data) => {
  return await api(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// ======================================================
// DELETE CATEGORY
// ======================================================

export const deleteCategory = async (id) => {
  return await api(`/categories/${id}`, {
    method: "DELETE",
  });
};