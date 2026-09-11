"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  getLibrarianById,
  updateLibrarian,
  updateLibrarianPermissions,
} from "@/services/librarian.service";

const permissions = [
  "bookView",
  "bookCreate",
  "bookUpdate",
  "bookDelete",
  "memberView",
  "memberCreate",
  "memberUpdate",
  "memberDelete",
  "categoryView",
  "categoryCreate",
  "categoryUpdate",
  "categoryDelete",
  "walletView",
  "walletManage",
  "rentalView",
  "rentalCreate",
  "rentalReturn",
  "reservationView",
  "reservationManage",
  "dashboardView",
  "reportView",
];

const viewPermissionByMutation = {
  bookCreate: "bookView",
  bookUpdate: "bookView",
  bookDelete: "bookView",
  memberCreate: "memberView",
  memberUpdate: "memberView",
  memberDelete: "memberView",
  categoryCreate: "categoryView",
  categoryUpdate: "categoryView",
  categoryDelete: "categoryView",
  walletManage: "memberView",
};

export default function LibrarianDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    status: "ACTIVE",
  });
  const [rights, setRights] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getLibrarianById(id);

        setItem(response.data);

        setForm({
          name: response.data.name || "",
          email: response.data.email || "",
          status: response.data.status || "ACTIVE",
        });

        setRights({
          ...Object.fromEntries(
            permissions.map((key) => [
              key,
              Boolean(response.data[key]),
            ])
          ),
          dashboardView: true,
        });
      } catch (e) {
        setError(
          e.response?.data?.message ||
            "Unable to load librarian."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const togglePermission = (key, enabled) => {
    setRights((current) => ({
      ...current,
      [key]: enabled,
      ...(enabled && viewPermissionByMutation[key]
        ? {
            [viewPermissionByMutation[key]]: true,
          }
        : {}),
    }));
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await updateLibrarian(id, form);

      await updateLibrarianPermissions(id, {
        ...rights,
        dashboardView: true,
      });

      toast.success(
        "Librarian updated successfully."
      );

      router.push("/admin/librarians");
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Unable to update librarian."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-sm text-slate-500">
        Loading librarian...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        type="button"
        onClick={() =>
          router.push("/admin/librarians")
        }
        className="text-sm font-semibold text-blue-700"
      >
        Back to librarians
      </button>

      <div>
        <h1 className="text-3xl font-bold">
          Edit librarian
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update staff details and access permissions.
        </p>
      </div>

      <form
        onSubmit={save}
        className="space-y-6 rounded-xl border bg-white p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Status
            </span>

            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
              className="w-full rounded-lg border px-3 py-2.5 text-sm"
            >
              <option>ACTIVE</option>
              <option>INACTIVE</option>
            </select>
          </label>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Permissions
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {permissions.map((key) => (
              <label
                key={key}
                className="flex items-center gap-2 rounded-lg border p-3 text-sm"
              >
                <input
                  type="checkbox"
                  disabled={key === "dashboardView"}
                  checked={
                    key === "dashboardView" ||
                    Boolean(rights[key])
                  }
                  onChange={(e) =>
                    togglePermission(
                      key,
                      e.target.checked
                    )
                  }
                />

                {key === "dashboardView"
                  ? "dashboardView (required)"
                  : key}
              </label>
            ))}
          </div>
        </div>

        <button
          disabled={saving}
          className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  type = "text",
  ...props
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <input
        type={type}
        className="w-full rounded-lg border px-3 py-2.5 text-sm"
        {...props}
      />
    </label>
  );
}