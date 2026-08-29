"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/category.service";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  // ======================================================
  // LOAD CATEGORIES
  // ======================================================

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCategories();

      console.log("Category Response:", response);

      // Backend response:
      // data: {
      //   categories: []
      // }

      const categoryList =
        response?.data?.categories;

      setCategories(
        Array.isArray(categoryList)
          ? categoryList
          : []
      );
    } catch (error) {
      console.error(
        "Category load error:",
        error
      );

      setError(
        error.message ||
          "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadCategories();
  }, []);

  // ======================================================
  // SEARCH
  // ======================================================

  const filteredCategories = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name
          ?.toLowerCase()
          .includes(value) ||
        category.description
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [categories, search]);

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // ADD CATEGORY
  // ======================================================

  const handleAdd = () => {
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
    });

    setError("");
    setShowModal(true);
  };

  // ======================================================
  // EDIT CATEGORY
  // ======================================================

  const handleEdit = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description:
        category.description || "",
    });

    setError("");
    setShowModal(true);
  };

  // ======================================================
  // CREATE / UPDATE
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const name = form.name.trim();

      const description =
        form.description.trim();

      // Frontend validation

      if (!name) {
        setError(
          "Category name is required"
        );
        return;
      }

      if (name.length < 2) {
        setError(
          "Category name must be at least 2 characters"
        );
        return;
      }

      const payload = {
        name,
        description,
      };

      // UPDATE

      if (editingCategory) {
        await updateCategory(
          editingCategory.id,
          payload
        );
      }

      // CREATE

      else {
        await createCategory(payload);
      }

      // Close modal

      setShowModal(false);

      setEditingCategory(null);

      setForm({
        name: "",
        description: "",
      });

      // Reload categories

      await loadCategories();
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

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteCategory(id);

      await loadCategories();
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete category"
      );
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <p className="mt-4 text-sm text-gray-500">
            Loading categories...
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Categories
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage library categories
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          + Add Category
        </button>

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">

          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() => setError("")}
            className="text-sm font-semibold text-red-500"
          >
            ✕
          </button>

        </div>
      )}

      {/* ==================================================
          SEARCH
      ================================================== */}

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

        <input
          type="text"
          placeholder="Search category..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
        />

      </div>

      {/* ==================================================
          CATEGORY COUNT
      ================================================== */}

      <div className="mb-4 flex items-center justify-between">

        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredCategories.length}
          </span>{" "}
          categories
        </p>

      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-gray-200 bg-gray-50">

              <tr>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  #
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Description
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Created
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredCategories.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="px-5 py-16 text-center"
                  >

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                      📚
                    </div>

                    <p className="mt-4 font-semibold text-gray-900">
                      No categories found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Create your first category.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredCategories.map(
                  (category, index) => (

                    <tr
                      key={category.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* NUMBER */}

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>

                      {/* CATEGORY */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg">
                            📚
                          </div>

                          <div>

                            <p className="font-semibold text-gray-900">
                              {category.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              ID: {category.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* DESCRIPTION */}

                      <td className="max-w-md px-5 py-4">

                        <p className="truncate text-sm text-gray-500">
                          {category.description ||
                            "No description"}
                        </p>

                      </td>

                      {/* CREATED */}

                      <td className="px-5 py-4 text-sm text-gray-500">

                        {category.createdAt
                          ? new Date(
                              category.createdAt
                            ).toLocaleDateString()
                          : "-"}

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              handleEdit(
                                category
                              )
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                category.id
                              )
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 p-6">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingCategory
                    ? "Update category information"
                    : "Create a new library category"}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              {/* NAME */}

              <div className="mb-5">

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Fiction"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />

              </div>

              {/* DESCRIPTION */}

              <div className="mb-6">

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter category description..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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