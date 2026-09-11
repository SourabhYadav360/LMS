"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {deleteLibrarian,getLibrarians,} from "@/services/librarian.service";

export default function LibrariansPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLibrarians();

      setItems(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Unable to load librarians."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const remove = async (item) => {
    if (
      !window.confirm(
        `Delete librarian "${item.name}"?`
      )
    ) {
      return;
    }

    try {
      setDeleting(item.id);

      const response = await deleteLibrarian(item.id);

      setItems((current) =>
        current.filter(
          (entry) => entry.id !== item.id
        )
      );

      toast.success(
        response.message ||
          "Librarian deleted successfully."
      );
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Unable to delete librarian."
      );
    } finally {
      setDeleting(null);
    }
  };

  const filtered = items.filter((item) =>
    `${item.name} ${item.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Header router={router} />

      <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search librarians..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
        />

        <button
          type="button"
          onClick={load}
          className="rounded-lg border px-4 text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <State text="Loading librarians..." />
      ) : !error && filtered.length === 0 ? (
        <State text="No librarians found." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-semibold">
                    {item.name}
                  </td>

                  <td className="p-4 text-slate-600">
                    {item.email}
                  </td>

                  <td className="p-4">
                    {item.status}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/librarians/${item.id}`
                        )
                      }
                      className="mr-3 font-semibold text-blue-700"
                    >
                      View/Edit
                    </button>

                    <button
                      type="button"
                      disabled={deleting === item.id}
                      onClick={() => remove(item)}
                      className="font-semibold text-red-600"
                    >
                      {deleting === item.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
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

function Header({ router }) {
  return (
    <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          People
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Librarians
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage staff accounts and permissions.
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          router.push("/admin/librarians/create")
        }
        className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white"
      >
        Add librarian
      </button>
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