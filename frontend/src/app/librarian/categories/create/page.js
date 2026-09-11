"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createCategory } from "@/services/category.service";

export default function LibrarianCreateCategoryPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      setError(
        "Category name must be at least 2 characters."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await createCategory({
        name: form.name.trim(),
        description: form.description.trim(),
      });

      toast.success(
        response.message ||
          "Category created successfully."
      );

      router.push("/librarian/categories");
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
      <button
        type="button"
        onClick={() =>
          router.push("/librarian/categories")
        }
        className="text-sm font-semibold text-blue-700"
      >
        Back to categories
      </button>

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          Catalog
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Add category
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a category for organizing books.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-xl border bg-white p-6"
      >
        <Field
          label="Name"
          value={form.name}
          onChange={(event) =>
            setForm({
              ...form,
              name: event.target.value,
            })
          }
          required
        />

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            Description
          </span>

          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value,
              })
            }
            rows="5"
            className="w-full rounded-lg border px-3 py-2.5 text-sm"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              router.push("/librarian/categories")
            }
            disabled={saving}
            className="rounded-lg border px-4 py-2.5 text-sm font-semibold"
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

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <input
        className="w-full rounded-lg border px-3 py-2.5 text-sm"
        {...props}
      />
    </label>
  );
}