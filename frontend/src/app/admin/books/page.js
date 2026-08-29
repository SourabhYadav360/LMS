"use client";

import { useEffect, useState } from "react";

import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
} from "@/services/admin.service";

export default function BooksPage() {
  // ======================================================
  // STATES
  // ======================================================

  const [books, setBooks] = useState([]);

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingBook, setEditingBook] =
    useState(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    totalCopies: 1,
    categoryId: "",
  });

  // ======================================================
  // FETCH BOOKS
  // ======================================================

  const fetchBooks = async () => {
    try {
      setError("");

      const response = await getBooks();

      console.log(
        "Books response:",
        response
      );

      setBooks(
        response?.data?.books || []
      );
    } catch (error) {
      console.error(
        "Get books error:",
        error
      );

      setError(
        error.message ||
          "Failed to fetch books"
      );

      setBooks([]);
    }
  };

  // ======================================================
  // FETCH CATEGORIES
  // ======================================================

  const fetchCategories = async () => {
    try {
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
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        await Promise.all([
          fetchBooks(),
          fetchCategories(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ======================================================
  // OPEN CREATE MODAL
  // ======================================================

  const openCreateModal = () => {
    setEditingBook(null);

    setFormData({
      title: "",
      author: "",
      isbn: "",
      description: "",
      totalCopies: 1,
      categoryId: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ======================================================
  // OPEN EDIT MODAL
  // ======================================================

  const openEditModal = (book) => {
    setEditingBook(book);

    setFormData({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      description:
        book.description || "",
      totalCopies:
        book.totalCopies || 1,
      categoryId:
        book.categoryId ||
        book.category?.id ||
        "",
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

    setEditingBook(null);

    setFormData({
      title: "",
      author: "",
      isbn: "",
      description: "",
      totalCopies: 1,
      categoryId: "",
    });
  };

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // CREATE / UPDATE BOOK
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      setError("");
      setSuccess("");

      // --------------------------------------------------
      // VALIDATION
      // --------------------------------------------------

      if (!formData.title.trim()) {
        setError(
          "Book title is required"
        );
        return;
      }

      if (!formData.author.trim()) {
        setError(
          "Author name is required"
        );
        return;
      }

      if (!formData.isbn.trim()) {
        setError("ISBN is required");
        return;
      }

      if (!formData.categoryId) {
        setError(
          "Please select a category"
        );
        return;
      }

      const copies =
        Number(formData.totalCopies);

      if (
        !Number.isInteger(copies) ||
        copies < 1
      ) {
        setError(
          "Total copies must be at least 1"
        );
        return;
      }

      // --------------------------------------------------
      // UPDATE
      // --------------------------------------------------

      if (editingBook) {
        await updateBook(
          editingBook.id,
          {
            title:
              formData.title.trim(),

            author:
              formData.author.trim(),

            isbn:
              formData.isbn.trim(),

            description:
              formData.description.trim(),

            totalCopies: copies,

            categoryId:
              Number(
                formData.categoryId
              ),
          }
        );

        setSuccess(
          "Book updated successfully"
        );
      }

      // --------------------------------------------------
      // CREATE
      // --------------------------------------------------

      else {
        await createBook({
          title:
            formData.title.trim(),

          author:
            formData.author.trim(),

          isbn:
            formData.isbn.trim(),

          description:
            formData.description.trim(),

          totalCopies: copies,

          categoryId:
            Number(
              formData.categoryId
            ),
        });

        setSuccess(
          "Book created successfully"
        );
      }

      // --------------------------------------------------
      // REFRESH
      // --------------------------------------------------

      await fetchBooks();

      // --------------------------------------------------
      // CLOSE MODAL
      // --------------------------------------------------

      setShowModal(false);

      setEditingBook(null);

      setFormData({
        title: "",
        author: "",
        isbn: "",
        description: "",
        totalCopies: 1,
        categoryId: "",
      });
    } catch (error) {
      console.error(
        "Save book error:",
        error
      );

      setError(
        error.message ||
          "Failed to save book"
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // DELETE BOOK
  // ======================================================

  const handleDelete = async (bookId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this book?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(bookId);

      setError("");
      setSuccess("");

      await deleteBook(bookId);

      setSuccess(
        "Book deleted successfully"
      );

      await fetchBooks();
    } catch (error) {
      console.error(
        "Delete book error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete book"
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
          Loading books...
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
            Books
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your library books
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          + Add Book
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

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Total Books
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {books.length}
          </p>

        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Total Copies
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {books.reduce(
              (total, book) =>
                total +
                Number(
                  book.totalCopies || 0
                ),
              0
            )}
          </p>

        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <p className="text-sm text-gray-500">
            Available Copies
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {books.reduce(
              (total, book) =>
                total +
                Number(
                  book.availableCopies ||
                    0
                ),
              0
            )}
          </p>

        </div>

      </div>

      {/* ==================================================
          BOOK TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-4">

          <h2 className="text-lg font-semibold text-gray-900">
            All Books
          </h2>

        </div>

        {books.length === 0 ? (
          <div className="px-6 py-12 text-center">

            <p className="text-gray-500">
              No books found
            </p>

            <button
              onClick={openCreateModal}
              className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Add First Book
            </button>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Book
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Author
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    ISBN
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Copies
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {books.map((book) => (

                  <tr
                    key={book.id}
                    className="hover:bg-gray-50"
                  >

                    {/* BOOK */}

                    <td className="px-6 py-4">

                      <p className="font-medium text-gray-900">
                        {book.title}
                      </p>

                      {book.description && (
                        <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                          {book.description}
                        </p>
                      )}

                    </td>

                    {/* AUTHOR */}

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {book.author}
                    </td>

                    {/* ISBN */}

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {book.isbn}
                    </td>

                    {/* CATEGORY */}

                    <td className="px-6 py-4">

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                        {book.category?.name ||
                          "No Category"}
                      </span>

                    </td>

                    {/* COPIES */}

                    <td className="px-6 py-4">

                      <p className="text-sm text-gray-700">
                        {book.availableCopies} /{" "}
                        {book.totalCopies}
                      </p>

                      <p className="text-xs text-gray-400">
                        Available / Total
                      </p>

                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">

                      {book.status ===
                      "AVAILABLE" ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                          Unavailable
                        </span>
                      )}

                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            openEditModal(
                              book
                            )
                          }
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              book.id
                            )
                          }
                          disabled={
                            deletingId ===
                            book.id
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId ===
                          book.id
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

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  {editingBook
                    ? "Edit Book"
                    : "Add Book"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingBook
                    ? "Update book information"
                    : "Add a new book to the library"}
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

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Book Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter book title"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

              </div>

              {/* AUTHOR */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Author
                </label>

                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Enter author name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

              </div>

              {/* ISBN */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ISBN
                </label>

                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  placeholder="Enter ISBN"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

              </div>

              {/* CATEGORY */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                >

                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* TOTAL COPIES */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Total Copies
                </label>

                <input
                  type="number"
                  name="totalCopies"
                  min="1"
                  value={
                    formData.totalCopies
                  }
                  onChange={handleChange}
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
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  placeholder="Enter book description"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
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
                    : editingBook
                    ? "Update Book"
                    : "Add Book"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}