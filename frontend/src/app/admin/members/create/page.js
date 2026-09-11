"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { createMember } from "@/services/member.service";

export default function CreateMemberPage() {
  const appRouter = useRouter();

  const membersPath = usePathname().startsWith(
    "/librarian/"
  )
    ? "/librarian/members"
    : "/admin/members";

  const router = {
    ...appRouter,
    push: (path) =>
      appRouter.push(
        path.replace(
          "/admin/members",
          membersPath
        )
      ),
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const submit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await createMember(form);

      toast.success(
        response.message ||
          "Member created successfully."
      );

      router.push("/admin/members");
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
      <div>
        <button
          type="button"
          onClick={() =>
            router.push("/admin/members")
          }
          className="mb-3 text-sm font-semibold text-blue-700"
        >
          Back to members
        </button>

        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          People
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Add member
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a new library member account.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
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

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() =>
              router.push("/admin/members")
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
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        name={name}
        type={type}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        {...props}
      />
    </label>
  );
}