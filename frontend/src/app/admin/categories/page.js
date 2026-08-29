"use client";

import { useEffect, useState } from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/admin.service";

export default function CategoriesPage() {
  // ======================================================
  // STATES
  // ======================================================

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // ======================================================
  // FETCH CATEGORIES
  // ======================================================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getCategories();

      console.log(
        "Categories response:",
        response
      );

      setCategories(
        response?.data?.categories || []
      );
    } catch (error) {
      console.error(
        "Get categories error:",
        error
      );

      setError(
        error.message ||
          "Failed to fetch categories"
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchCategories();
  }, []);

  // ======================================================
  // OPEN CREATE MODAL
  // ======================================================

  const openCreateModal = () => {
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ======================================================
  // OPEN EDIT MODAL
  // ======================================================

  const openEditModal = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      description:
        category.description || "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);

    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
    });
  };

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // CREATE / UPDATE
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // --------------------------------------------------
      // BASIC FRONTEND VALIDATION
      // --------------------------------------------------

      if (!formData.name.trim()) {
        setError(
          "Category name is required"
        );

        return;
      }

      if (formData.name.trim().length < 2) {
        setError(
          "Category name must be at least 2 characters"
        );

        return;
      }

      // --------------------------------------------------
      // UPDATE
      // --------------------------------------------------

      if (editingCategory) {
        await updateCategory(
          editingCategory.id,
          {
            name: formData.name.trim(),
            description:
              formData.description.trim(),
          }
        );

        setSuccess(
          "Category updated successfully"
        );
      }

      // --------------------------------------------------
      // CREATE
      // --------------------------------------------------

      else {
        await createCategory({
          name: formData.name.trim(),
          description:
            formData.description.trim(),
        });

        setSuccess(
          "Category created successfully"
        );
      }

      // --------------------------------------------------
      // REFRESH
      // --------------------------------------------------

      await fetchCategories();

      // --------------------------------------------------
      // CLOSE
      // --------------------------------------------------

      setShowModal(false);

      setEditingCategory(null);

      setFormData({
        name: "",
        description: "",
      });
    } catch (error) {
      console.error(
        "Save category error:",
        error
      );

      setError(
        error.message ||
          "Failed to save category"
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(categoryId);

      setError("");
      setSuccess("");

      await deleteCategory(categoryId);

      setSuccess(
        "Category deleted successfully"
      );

      await fetchCategories();
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete category"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">
          Loading categories...
        </p>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Categories
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your library book categories
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          + Create Category
        </button>

      </div>

      {/* ==================================================
          ALERTS
      ================================================== */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          {success}
        </div>
      )}

      {/* ==================================================
          STATS
      ================================================== */}

      <div className="mb-6">

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Total Categories
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {categories.length}
          </p>

        </div>

      </div>

      {/* ==================================================
          CATEGORY TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-4">

          <h2 className="text-lg font-semibold text-gray-900">
            All Categories
          </h2>

        </div>

        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center">

            <p className="text-gray-500">
              No categories found
            </p>

            <button
              onClick={openCreateModal}
              className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Create First Category
            </button>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Name
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Description
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Created At
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {categories.map((category) => (

                  <tr
                    key={category.id}
                    className="hover:bg-gray-50"
                  >

                    {/* NAME */}

                    <td className="px-6 py-4">

                      <p className="font-medium text-gray-900">
                        {category.name}
                      </p>

                    </td>

                    {/* DESCRIPTION */}

                    <td className="px-6 py-4">

                      <p className="max-w-md text-sm text-gray-600">
                        {category.description ||
                          "No description"}
                      </p>

                    </td>

                    {/* DATE */}

                    <td className="px-6 py-4">

                      <p className="text-sm text-gray-500">
                        {category.createdAt
                          ? new Date(
                              category.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </p>

                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            openEditModal(
                              category
                            )
                          }
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              category.id
                            )
                          }
                          disabled={
                            deletingId ===
                            category.id
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId ===
                          category.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ==================================================
          CREATE / EDIT MODAL
      ================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  {editingCategory
                    ? "Edit Category"
                    : "Create Category"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingCategory
                    ? "Update category details"
                    : "Add a new book category"}
                </p>

              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter category description"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}