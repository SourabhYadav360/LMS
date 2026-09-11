"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createMember } from "@/services/member.service";

export default function LibrarianCreateMemberPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const change = (event) =>
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

  const submit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const response = await createMember(form);

      toast.success(
        response.message ||
          "Member created successfully."
      );

      router.push("/librarian/members");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to create member.";

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
          router.push("/librarian/members")
        }
        className="text-sm font-semibold text-blue-700"
      >
        Back to members
      </button>

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          People
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Add member
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a new library member account.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-xl border bg-white p-6"
      >
        <Field
          label="Name"
          name="name"
          value={form.name}
          onChange={change}
          required
        />

        <Field
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={change}
          required
        />

        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={change}
          minLength="6"
          required
        />

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              router.push("/librarian/members")
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
              : "Create member"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...props
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <input
        name={name}
        type={type}
        className="w-full rounded-lg border px-3 py-2.5 text-sm"
        {...props}
      />
    </label>
  );
}