"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getBooks } from "@/services/book.service";
import { rentBook } from "@/services/rental.service";
import { createReservation } from "@/services/reservation.service";

const RENTAL_RATE_PER_DAY = 1;

export default function MemberBooksPage() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [rentalBook, setRentalBook] = useState(null);
  const [days, setDays] = useState(7);
  const [quantity, setQuantity] = useState(1);

  const load = async () => {
    try {
      setLoading(true);

      const response = await getBooks();

      setBooks(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load books."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filtered = books.filter((book) =>
    `${book.title} ${book.author} ${book.isbn}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const confirmRent = async (event) => {
    event.preventDefault();

    const rentalDays = Number(days);
    const rentalQuantity = Number(quantity);

    if (
      !rentalBook ||
      !Number.isInteger(rentalDays) ||
      rentalDays < 1 ||
      !Number.isInteger(rentalQuantity) ||
      rentalQuantity < 1 ||
      rentalQuantity > rentalBook.availableCopies
    ) {
      toast.error(
        `Choose 1-${
          rentalBook?.availableCopies || 1
        } copies and at least 1 rental day.`
      );

      return;
    }

    try {
      setActionId(rentalBook.id);

      const response = await rentBook({
        bookId: rentalBook.id,
        days: rentalDays,
        quantity: rentalQuantity,
      });

      toast.success(
        response.message ||
          "Book rented successfully."
      );

      setRentalBook(null);
      setQuantity(1);

      load();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to rent book."
      );
    } finally {
      setActionId(null);
    }
  };

  const reserve = async (book) => {
    try {
      setActionId(book.id);

      const response = await createReservation({
        bookId: book.id,
      });

      toast.success(
        response.message ||
          "Reservation created successfully."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to reserve book."
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          Catalog
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Books
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Browse books, rent available copies, or
          reserve unavailable titles.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-blue-900">
            Rental rate: ₹1 per day
          </p>

          <p className="mt-1 text-xs text-blue-700">
            Your wallet is charged based on the number
            of rental days.
          </p>
        </div>

        <span className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-blue-800">
          ₹{RENTAL_RATE_PER_DAY}/day
        </span>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, author or ISBN..."
          className="w-full rounded-lg border px-3 py-2.5 text-sm"
        />
      </div>

      {loading ? (
        <State text="Loading books..." />
      ) : filtered.length === 0 ? (
        <State text="No books found." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((book) => (
            <article
              key={book.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-slate-900">
                    {book.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {book.author}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    book.availableCopies > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {book.availableCopies > 0
                    ? "Available"
                    : "Unavailable"}
                </span>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Available copies: {book.availableCopies ?? 0} /{" "}
                Total copies: {book.totalCopies ?? 0}
              </p>

              <div className="mt-5 flex gap-2">
                {book.availableCopies > 0 ? (
                  <button
                    type="button"
                    disabled={actionId === book.id}
                    onClick={() => {
                      setRentalBook(book);
                      setDays(7);
                      setQuantity(1);
                    }}
                    className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Rent · ₹1/day
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionId === book.id}
                    onClick={() => reserve(book)}
                    className="rounded-lg border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50"
                  >
                    Reserve
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {rentalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <form
            onSubmit={confirmRent}
            className="w-full max-w-md space-y-5 rounded-xl bg-white p-6 shadow-2xl"
          >
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Rent {rentalBook.title}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Rental price is ₹1 per day, per copy.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Rental days
                </span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={days}
                  onChange={(event) =>
                    setDays(event.target.value)
                  }
                  className="w-full rounded-lg border px-3 py-2.5 text-sm"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Copies
                </span>

                <input
                  type="number"
                  min="1"
                  max={rentalBook.availableCopies}
                  step="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  className="w-full rounded-lg border px-3 py-2.5 text-sm"
                />

                <span className="mt-1 block text-xs text-slate-500">
                  Up to {rentalBook.availableCopies}{" "}
                  available
                </span>
              </label>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>
                  {quantity || 0} copies × {days || 0}{" "}
                  days × ₹1
                </span>

                <strong className="text-slate-950">
                  ₹
                  {Number(quantity || 0) *
                    Number(days || 0) *
                    RENTAL_RATE_PER_DAY}
                </strong>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRentalBook(null)}
                disabled={actionId === rentalBook.id}
                className="rounded-lg border px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={actionId === rentalBook.id}
                className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {actionId === rentalBook.id
                  ? "Renting..."
                  : "Confirm rental"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function State({ text }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-xl border bg-white text-sm text-slate-500">
      {text}
    </div>
  );
}