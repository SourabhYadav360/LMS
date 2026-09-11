"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { toast } from "react-toastify";

import {
  getCategoryById,
  updateCategory,
} from "@/services/category.service";

export default function CategoryDetailsPage() {
  const { id } = useParams();
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

  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "true";

  const [category, setCategory] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const response = await getCategoryById(id);

        setCategory(response.data);

        setForm({
          name: response.data.name || "",
          description:
            response.data.description || "",
        });
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load category."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) loadCategory();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const response = await updateCategory(id, {
        name: form.name.trim(),
        description: form.description.trim(),
      });

      setCategory(response.data);

      toast.success(
        response.message ||
          "Category updated successfully."
      );

      router.replace(`/admin/categories/${id}`);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to update category."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
        Loading category...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!category) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
            {editMode
              ? "Edit category"
              : category.name}
          </h1>
        </div>

        {!editMode && (
          <button
            type="button"
            onClick={() =>
              router.push(
                `/admin/categories/${id}?edit=true`
              )
            }
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Edit category
          </button>
        )}
      </div>

      {editMode ? (
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

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/admin/categories/${id}`
                )
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Description
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {category.description ||
              "No description provided."}
          </p>
        </div>
      )}
    </div>
  );
}