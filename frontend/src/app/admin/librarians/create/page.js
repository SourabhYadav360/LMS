"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  createLibrarian,
  updateLibrarianPermissions,
} from "@/services/librarian.service";

const permissionGroups = [
  {
    title: "Books",
    items: [
      "bookView",
      "bookCreate",
      "bookUpdate",
      "bookDelete",
    ],
  },
  {
    title: "Members",
    items: [
      "memberView",
      "memberCreate",
      "memberUpdate",
      "memberDelete",
    ],
  },
  {
    title: "Categories",
    items: [
      "categoryView",
      "categoryCreate",
      "categoryUpdate",
      "categoryDelete",
    ],
  },
  {
    title: "Wallet",
    items: ["walletView", "walletManage"],
  },
  {
    title: "Rentals",
    items: [
      "rentalView",
      "rentalCreate",
      "rentalReturn",
    ],
  },
  {
    title: "Reservations",
    items: [
      "reservationView",
      "reservationManage",
    ],
  },
  {
    title: "Other",
    items: ["dashboardView", "reportView"],
  },
];

const permissionLabels = {
  bookView: "View books",
  bookCreate: "Create books",
  bookUpdate: "Update books",
  bookDelete: "Delete books",

  memberView: "View members",
  memberCreate: "Create members",
  memberUpdate: "Update members",
  memberDelete: "Delete members",

  categoryView: "View categories",
  categoryCreate: "Create categories",
  categoryUpdate: "Update categories",
  categoryDelete: "Delete categories",

  walletView: "View wallet",
  walletManage: "Manage wallet",

  rentalView: "View rentals",
  rentalCreate: "Create rentals",
  rentalReturn: "Return rentals",

  reservationView: "View reservations",
  reservationManage: "Manage reservations",

  dashboardView: "View dashboard",
  reportView: "View reports",
};

const permissionKeys = permissionGroups.flatMap(
  (group) => group.items
);

const emptyPermissions = {
  ...Object.fromEntries(
    permissionKeys.map((permission) => [
      permission,
      false,
    ])
  ),
  dashboardView: true,
};

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

export default function CreateLibrarianPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [permissions, setPermissions] =
    useState(emptyPermissions);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const toggle = (permission) => {
    if (permission === "dashboardView") return;

    setPermissions((current) => {
      const enabled = !current[permission];

      return {
        ...current,
        [permission]: enabled,

        ...(enabled &&
        viewPermissionByMutation[permission]
          ? {
              [viewPermissionByMutation[permission]]:
                true,
            }
          : {}),
      };
    });
  };

  const toggleGroup = (group) => {
    const selected = group.items.every(
      (permission) => permissions[permission]
    );

    setPermissions((current) => ({
      ...current,
      ...Object.fromEntries(
        group.items.map((permission) => [
          permission,
          permission === "dashboardView"
            ? true
            : !selected,
        ])
      ),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await createLibrarian(form);

      const librarianId = response.data?.id;

      if (librarianId) {
        await updateLibrarianPermissions(
          librarianId,
          {
            ...permissions,
            dashboardView: true,
          }
        );
      }

      toast.success(
        response.message ||
          "Librarian created successfully."
      );

      router.push("/admin/librarians");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to create librarian.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() =>
            router.push("/admin/librarians")
          }
          className="mb-3 text-sm font-semibold text-blue-700"
        >
          Back to librarians
        </button>

        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          People
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Add librarian
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a staff account and choose its access
          permissions.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
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
        </div>

        <section className="border-t border-slate-100 pt-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Permissions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the operations this librarian can
                access.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setPermissions(emptyPermissions)
              }
              className="text-sm font-semibold text-slate-600"
            >
              Clear all
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {permissionGroups.map((group) => {
              const allSelected = group.items.every(
                (permission) =>
                  permissions[permission]
              );

              return (
                <div
                  key={group.title}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">
                      {group.title}
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        toggleGroup(group)
                      }
                      className="text-xs font-semibold text-blue-700"
                    >
                      {allSelected
                        ? "Clear"
                        : "Select all"}
                    </button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.items.map(
                      (permission) => (
                        <label
                          key={permission}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={
                              permissions[permission]
                            }
                            onChange={() =>
                              toggle(permission)
                            }
                            className="h-4 w-4 rounded border-slate-300 text-blue-700"
                          />

                          {permissionLabels[permission]}
                        </label>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() =>
              router.push("/admin/librarians")
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
              : "Create librarian"}
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