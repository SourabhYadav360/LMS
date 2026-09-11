"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  getBooks,
  deleteBook,
} from "@/services/book.service";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/utils/permissions";

export default function BooksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const booksBasePath = typeof window !== "undefined" && window.location.pathname.startsWith("/librarian/")
    ? "/librarian/books"
    : "/admin/books";

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const showPermissionDenied = () => {
    toast.error("You do not have permission for this action");
  };

  const runWithPermission = (permission, action) => {
    if (!hasPermission(user, permission)) {
      showPermissionDenied();
      return;
    }

    action();
  };

  const loadBooks = async () => {
    try {
      setLoading(true);

      const response = await getBooks();

      if (response?.success) {
        setBooks(Array.isArray(response.data) ? response.data : []);
      } else {
        setBooks([]);
        toast.error(response?.message || "Unable to load books");
      }
    } catch (error) {
      console.error("Get books error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Unable to load books"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadBooks, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredBooks = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return books;
    }

    return books.filter((book) => {
      return (
        book?.title?.toLowerCase().includes(value) ||
        book?.author?.toLowerCase().includes(value) ||
        book?.isbn?.toLowerCase().includes(value)
      );
    });
  }, [books, search]);

  const handleDelete = async (bookId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(bookId);

      const response = await deleteBook(bookId);

      if (response?.success) {
        toast.success(
          response?.message || "Book deleted successfully"
        );

        setBooks((previousBooks) =>
          previousBooks.filter(
            (book) => book.id !== bookId
          )
        );
      } else {
        toast.error(
          response?.message || "Unable to delete book"
        );
      }
    } catch (error) {
      console.error("Delete book error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Unable to delete book"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Books
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage all books in your library.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              runWithPermission("bookCreate", () =>
                router.push(`${booksBasePath}/create`)
              )
            }
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            + Add Book
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by title, author or ISBN..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            type="button"
            onClick={loadBooks}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-sm text-slate-500">
                Loading books...
              </div>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 text-4xl">📚</div>

              <h3 className="text-lg font-semibold text-slate-900">
                No books found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? "Try changing your search."
                  : "Start by adding your first book."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() =>
                    runWithPermission("bookCreate", () =>
                      router.push(`${booksBasePath}/create`)
                    )
                  }
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Add Book
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Title
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Author
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      ISBN
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Copies
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map((book) => (
                    <tr
                      key={book.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {book.title || "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {book.author || "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {book.isbn || "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {book.totalCopies ?? "-"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              runWithPermission("bookView", () =>
                                router.push(
                                  `${booksBasePath}/${book.id}`
                                )
                              )
                            }
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              runWithPermission("bookUpdate", () =>
                                router.push(
                                  `${booksBasePath}/${book.id}?edit=true`
                                )
                              )
                            }
                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === book.id}
                            onClick={() =>
                              runWithPermission("bookDelete", () =>
                                handleDelete(book.id)
                              )
                            }
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === book.id
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
      </div>
  );
}