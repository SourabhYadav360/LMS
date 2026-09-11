"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  getMyRentals,
  returnBook,
} from "@/services/rental.service";

export default function MemberRentalsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);

      const response = await getMyRentals();

      setItems(response.data?.rentals || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load rentals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleReturn = async (item) => {
    if (!window.confirm("Return this book?")) {
      return;
    }

    try {
      setReturningId(item.id);

      const response = await returnBook(item.id);

      setItems((current) =>
        current.map((rental) =>
          rental.id === item.id
            ? {
                ...rental,
                status: "RETURNED",
                returnedAt: new Date().toISOString(),
              }
            : rental
        )
      );

      toast.success(
        response.message ||
          "Book returned successfully."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to return book."
      );
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          History
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          My Rentals
        </h1>
      </div>

      {loading ? (
        <State text="Loading rentals..." />
      ) : items.length === 0 ? (
        <State text="No rental history yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Book</th>
                <th className="p-4">Rented</th>
                <th className="p-4">Due</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-semibold">
                    {item.book?.title || item.bookId}
                  </td>

                  <td className="p-4">
                    {format(item.rentedAt)}
                  </td>

                  <td className="p-4">
                    {format(item.dueDate)}
                  </td>

                  <td className="p-4">
                    <span
                      className={
                        item.status === "RETURNED"
                          ? "font-semibold text-emerald-700"
                          : ""
                      }
                    >
                      {item.status === "RETURNED"
                        ? "Book returned"
                        : item.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    {item.status !== "RETURNED" && (
                      <button
                        type="button"
                        disabled={
                          returningId === item.id
                        }
                        onClick={() =>
                          handleReturn(item)
                        }
                        className="font-semibold text-blue-700 disabled:opacity-50"
                      >
                        {returningId === item.id
                          ? "Returning..."
                          : "Return"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function format(value) {
  return value
    ? new Date(value).toLocaleDateString()
    : "-";
}

function State({ text }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-xl border bg-white text-sm text-slate-500">
      {text}
    </div>
  );
}