"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
} from "@/services/book.service";

import { getCategories } from "@/services/category.service";

export default function BooksPage() {
  // ======================================================
  // STATE
  // ======================================================

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    totalCopies: 1,
    categoryId: "",
  });

  // ======================================================
  // LOAD BOOKS
  // ======================================================

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBooks();

      console.log("BOOK API RESPONSE:", response);

      // Backend response:
      //
      // {
      //   success: true,
      //   data: {
      //     books: [...]
      //   }
      // }

      setBooks(response?.data?.books || []);
    } catch (error) {
      console.error("Books error:", error);

      setBooks([]);

      setError(
        error.message || "Failed to load books"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD CATEGORIES
  // ======================================================

  const loadCategories = async () => {
    try {
      const response = await getCategories();

      console.log(
        "CATEGORY API RESPONSE:",
        response
      );

      /*
        Backend agar:

        data: {
          categories: [...]
        }

        return response.data.categories
      */

      setCategories(
        response?.data?.categories || []
      );
    } catch (error) {
      console.error(
        "Categories error:",
        error
      );

      setCategories([]);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadBooks();
    loadCategories();
  }, []);

  // ======================================================
  // SEARCH
  // ======================================================

  const filteredBooks = useMemo(() => {
    if (!Array.isArray(books)) {
      return [];
    }

    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return books;
    }

    return books.filter((book) => {
      return (
        book.title
          ?.toLowerCase()
          .includes(value) ||

        book.author
          ?.toLowerCase()
          .includes(value) ||

        book.isbn
          ?.toLowerCase()
          .includes(value) ||

        book.category?.name
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [books, search]);

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // ADD BOOK
  // ======================================================

  const handleAdd = () => {
    setEditingBook(null);

    setForm({
      title: "",
      author: "",
      isbn: "",
      description: "",
      totalCopies: 1,
      categoryId: "",
    });

    setError("");

    setShowModal(true);
  };

  // ======================================================
  // EDIT BOOK
  // ======================================================

  const handleEdit = (book) => {
    setEditingBook(book);

    setForm({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      description: book.description || "",
      totalCopies: book.totalCopies || 1,
      categoryId: book.categoryId || "",
    });

    setError("");

    setShowModal(true);
  };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingBook(null);
  };

  // ======================================================
  // SAVE BOOK
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      // --------------------------------------------
      // BASIC FRONTEND VALIDATION
      // --------------------------------------------

      if (!form.title.trim()) {
        setError("Book title is required");
        return;
      }

      if (!form.author.trim()) {
        setError("Author is required");
        return;
      }

      if (!form.isbn.trim()) {
        setError("ISBN is required");
        return;
      }

      if (!form.categoryId) {
        setError("Please select a category");
        return;
      }

      if (
        !Number.isInteger(
          Number(form.totalCopies)
        ) ||
        Number(form.totalCopies) < 1
      ) {
        setError(
          "Total copies must be at least 1"
        );

        return;
      }

      // --------------------------------------------
      // PAYLOAD
      // --------------------------------------------

      const payload = {
        title: form.title.trim(),

        author: form.author.trim(),

        isbn: form.isbn.trim(),

        description:
          form.description.trim(),

        totalCopies: Number(
          form.totalCopies
        ),

        categoryId: Number(
          form.categoryId
        ),
      };

      console.log(
        "BOOK PAYLOAD:",
        payload
      );

      // --------------------------------------------
      // UPDATE
      // --------------------------------------------

      if (editingBook) {
        await updateBook(
          editingBook.id,
          payload
        );
      }

      // --------------------------------------------
      // CREATE
      // --------------------------------------------

      else {
        await createBook(payload);
      }

      // --------------------------------------------
      // CLOSE MODAL
      // --------------------------------------------

      setShowModal(false);
      setEditingBook(null);

      // --------------------------------------------
      // RESET FORM
      // --------------------------------------------

      setForm({
        title: "",
        author: "",
        isbn: "",
        description: "",
        totalCopies: 1,
        categoryId: "",
      });

      // --------------------------------------------
      // RELOAD BOOKS
      // --------------------------------------------

      await loadBooks();
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

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteBook(id);

      await loadBooks();
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
      setDeleting(false);
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
            Loading books...
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

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Books
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage library books
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          + Add Book
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
            type="button"
            onClick={() => setError("")}
            className="text-sm font-semibold text-red-600 hover:text-red-800"
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
          placeholder="Search by title, author, ISBN or category..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
        />

      </div>

      {/* ==================================================
          BOOK COUNT
      ================================================== */}

      <div className="mb-4 flex items-center justify-between">

        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredBooks.length}
          </span>{" "}
          books
        </p>

      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px] text-left">

            {/* ==================================================
                TABLE HEADER
            ================================================== */}

            <thead className="border-b border-gray-200 bg-gray-50">

              <tr>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Book
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Author
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  ISBN
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Copies
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>

              </tr>

            </thead>

            {/* ==================================================
                TABLE BODY
            ================================================== */}

            <tbody className="divide-y divide-gray-100">

              {filteredBooks.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center"
                  >

                    <div className="text-4xl">
                      📚
                    </div>

                    <p className="mt-3 font-medium text-gray-900">
                      No books found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Try changing your search
                      or add a new book.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredBooks.map((book) => (

                  <tr
                    key={book.id}
                    className="transition hover:bg-gray-50"
                  >

                    {/* BOOK */}

                    <td className="px-5 py-4">

                      <div>
                        <p className="font-semibold text-gray-900">
                          {book.title}
                        </p>

                        {book.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {book.description}
                          </p>
                        )}
                      </div>

                    </td>

                    {/* AUTHOR */}

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {book.author}
                    </td>

                    {/* ISBN */}

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {book.isbn}
                    </td>

                    {/* CATEGORY */}

                    <td className="px-5 py-4">

                      <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {book.category?.name ||
                          "No Category"}
                      </span>

                    </td>

                    {/* COPIES */}

                    <td className="px-5 py-4">

                      <div className="text-sm">

                        <span className="font-semibold text-gray-900">
                          {book.availableCopies}
                        </span>

                        <span className="text-gray-500">
                          {" "}
                          / {book.totalCopies}
                        </span>

                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        Available
                      </p>

                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">

                      {book.status ===
                      "AVAILABLE" ? (

                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Available
                        </span>

                      ) : (

                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          Unavailable
                        </span>

                      )}

                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(book)
                          }
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-black hover:text-black"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={deleting}
                          onClick={() =>
                            handleDelete(
                              book.id
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

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

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  {editingBook
                    ? "Edit Book"
                    : "Add New Book"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingBook
                    ? "Update book information"
                    : "Add a new book to the library"}
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg px-3 py-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                {/* TITLE */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Book Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter book title"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
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
                    value={form.author}
                    onChange={handleChange}
                    placeholder="Enter author name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
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
                    value={form.isbn}
                    onChange={handleChange}
                    placeholder="Enter ISBN"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
                  />

                </div>

                {/* CATEGORY */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Category
                  </label>

                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  >

                    <option value="">
                      Select category
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
                    value={form.totalCopies}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter book description"
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
                  />

                </div>

              </div>

              {/* FORM BUTTONS */}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
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
                    : editingBook
                    ? "Update Book"
                    : "Create Book"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}