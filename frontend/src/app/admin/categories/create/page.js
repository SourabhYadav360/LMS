"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { createCategory } from "@/services/category.service";

export default function CreateCategoryPage() {
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

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      setError(
        "Category name must be at least 2 characters."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await createCategory({
        name: form.name.trim(),
        description: form.description.trim(),
      });

      toast.success(
        response.message ||
          "Category created successfully."
      );

      router.push("/admin/categories");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to create category.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() =>
            router.push("/admin/categories")
          }
          className="mb-3 text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          Back to categories
        </button>

        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          Catalog
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Add category
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a category for organizing books.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Name
          </span>

          <input
            name="name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </span>

          <textarea
            name="description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            rows="5"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() =>
              router.push("/admin/categories")
            }
            disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Creating..."
              : "Create category"}
          </button>
        </div>
      </form>
    </div>
  );
}