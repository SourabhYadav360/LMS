"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { createBook } from "@/services/book.service";
import { getCategories } from "@/services/category.service";

export default function CreateBookPage() {
  const router = useRouter();
  const pathname = usePathname();
  const booksPath = pathname.startsWith("/librarian/")
    ? "/librarian/books"
    : "/admin/books";

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    totalCopies: "",
    categoryId: "",
  });

  const [errors, setErrors] = useState({});

  // -----------------------------
  // Load Categories
  // -----------------------------
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);

      const response = await getCategories();

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to load categories"
        );
      }

      setCategories(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load categories"
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadCategories, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // -----------------------------
  // Input Change
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove field error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // -----------------------------
  // Validation
  // -----------------------------
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Book title is required";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author is required";
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn = "ISBN is required";
    }

    if (!formData.totalCopies) {
      newErrors.totalCopies = "Total copies are required";
    } else if (Number(formData.totalCopies) <= 0) {
      newErrors.totalCopies =
        "Total copies must be greater than 0";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim(),
        description: formData.description.trim(),
        totalCopies: Number(formData.totalCopies),
        categoryId: formData.categoryId,
      };

      const response = await createBook(payload);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to create book"
        );
      }

      toast.success(
        response?.message || "Book created successfully"
      );

      router.push(booksPath);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create book"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push(booksPath)}
            className="mb-3 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back to Books
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            Add New Book
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Add a new book to the library.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Card Header */}
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Book Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the details of the book below.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Book Title <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter book title"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                    errors.title
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                  }`}
                />

                {errors.title && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Author */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Author <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Enter author name"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                    errors.author
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                  }`}
                />

                {errors.author && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.author}
                  </p>
                )}
              </div>

              {/* ISBN */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  ISBN <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  placeholder="Enter ISBN"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                    errors.isbn
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                  }`}
                />

                {errors.isbn && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.isbn}
                  </p>
                )}
              </div>

              {/* Total Copies */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Total Copies{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  name="totalCopies"
                  min="1"
                  value={formData.totalCopies}
                  onChange={handleChange}
                  placeholder="Enter number of copies"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                    errors.totalCopies
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                  }`}
                />

                {errors.totalCopies && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.totalCopies}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category{" "}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  disabled={loadingCategories}
                  className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition ${
                    errors.categoryId
                      ? "border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                  }`}
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                {errors.categoryId && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.categoryId}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Enter book description..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => router.push(booksPath)}
                disabled={loading}
                className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Book"}
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}