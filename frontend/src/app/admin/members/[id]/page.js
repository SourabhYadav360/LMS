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
  getMemberById,
  updateMember,
} from "@/services/member.service";

export default function MemberDetailsPage() {
  const { id } = useParams();
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

  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "true";

  const [member, setMember] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMember = async () => {
      try {
        const response = await getMemberById(id);

        setMember(response.data);

        setForm({
          name: response.data.name || "",
          email: response.data.email || "",
          status: response.data.status || "ACTIVE",
        });
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load member."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) loadMember();
  }, [id]);

  const submit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const response = await updateMember(id, form);

      setMember(response.data);

      toast.success(
        response.message ||
          "Member updated successfully."
      );

      router.replace(`/admin/members/${id}`);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to update member."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
        Loading member...
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

  if (!member) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
            {editMode ? "Edit member" : member.name}
          </h1>

          {!editMode && (
            <p className="mt-2 text-sm text-slate-500">
              {member.email}
            </p>
          )}
        </div>

        {!editMode && (
          <button
            type="button"
            onClick={() =>
              router.push(
                `/admin/members/${id}?edit=true`
              )
            }
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Edit member
          </button>
        )}
      </div>

      {editMode ? (
        <form
          onSubmit={submit}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <Field
            label="Name"
            name="name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
          />

          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            required
          />

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </span>

            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/admin/members/${id}`
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
              {saving
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Detail
            label="Status"
            value={member.status}
          />

          <Detail
            label="Wallet balance"
            value={member.wallet?.balance ?? 0}
          />

          <Detail
            label="Rentals"
            value={member.rentals?.length ?? 0}
          />

          <Detail
            label="Reservations"
            value={
              member.reservations?.length ?? 0
            }
          />
        </div>
      )}
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

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}