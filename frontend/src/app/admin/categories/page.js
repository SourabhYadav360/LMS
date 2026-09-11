"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  deleteCategory,
  getCategories,
} from "@/services/category.service";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/utils/permissions";

export default function CategoriesPage() {
  const appRouter = useRouter();

  const categoriesPath = usePathname().startsWith(
    "/librarian/"
  )
    ? "/librarian/categories"
    : "/admin/categories";

  const router = {
    ...appRouter,
    push: (path) =>
      appRouter.push(
        path.replace(
          "/admin/categories",
          categoriesPath
        )
      ),
  };

  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const runWithPermission = (permission, action) => {
    if (!hasPermission(user, permission)) {
      toast.error(
        "You do not have permission for this action"
      );
      return;
    }

    action();
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCategories();

      setCategories(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(
      loadCategories,
      0
    );

    return () => window.clearTimeout(timer);
  }, []);

  const filteredCategories = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return categories;

    return categories.filter((category) =>
      `${category.name} ${
        category.description || ""
      }`
        .toLowerCase()
        .includes(value)
    );
  }, [categories, search]);

  const handleDelete = async (category) => {
    if (
      !window.confirm(
        `Delete category "${category.name}"?`
      )
    ) {
      return;
    }

    try {
      setDeletingId(category.id);

      const response = await deleteCategory(
        category.id
      );

      setCategories((current) =>
        current.filter(
          (item) => item.id !== category.id
        )
      );

      toast.success(
        response.message ||
          "Category deleted successfully."
      );
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Catalog
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Categories
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Organize books into manageable categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            runWithPermission(
              "categoryCreate",
              () =>
                router.push(
                  "/admin/categories/create"
                )
            )
          }
          className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Add category
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search categories..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={loadCategories}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}

          <button
            type="button"
            onClick={loadCategories}
            className="ml-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {!error && loading && (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500">
          Loading categories...
        </div>
      )}

      {!error &&
        !loading &&
        filteredCategories.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              {search
                ? "No matching categories"
                : "No categories yet"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Try a different search term."
                : "Create a category to organize your books."}
            </p>
          </div>
        )}

      {!error &&
        !loading &&
        filteredCategories.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">
                      Name
                    </th>

                    <th className="px-5 py-3">
                      Description
                    </th>

                    <th className="px-5 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map(
                    (category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {category.name}
                        </td>

                        <td className="max-w-xl px-5 py-4 text-slate-600">
                          {category.description ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                runWithPermission(
                                  "categoryView",
                                  () =>
                                    router.push(
                                      `/admin/categories/${category.id}`
                                    )
                                )
                              }
                              className="font-semibold text-slate-700 hover:text-slate-950"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                runWithPermission(
                                  "categoryUpdate",
                                  () =>
                                    router.push(
                                      `/admin/categories/${category.id}?edit=true`
                                    )
                                )
                              }
                              className="font-semibold text-blue-700 hover:text-blue-900"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                category.id
                              }
                              onClick={() =>
                                runWithPermission(
                                  "categoryDelete",
                                  () =>
                                    handleDelete(
                                      category
                                    )
                                )
                              }
                              className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              {deletingId ===
                              category.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}