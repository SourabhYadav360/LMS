"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getLibrarians,
  createLibrarian,
  updateLibrarianPermissions,
  activateLibrarian,
  deactivateLibrarian,
} from "../../../services/admin.service";

// ======================================================
// DEFAULT PERMISSIONS
// ======================================================

const DEFAULT_PERMISSIONS = {
  bookView: false,
  bookCreate: false,
  bookUpdate: false,
  bookDelete: false,

  memberView: false,
  memberCreate: false,
  memberUpdate: false,
  memberDelete: false,

  categoryView: false,
  categoryCreate: false,
  categoryUpdate: false,
  categoryDelete: false,

  walletView: false,
  walletManage: false,

  rentalView: false,
  rentalCreate: false,
  rentalReturn: false,

  reservationView: false,
  reservationManage: false,

  dashboardView: false,
  reportView: false,
};

// ======================================================
// PERMISSION GROUPS
// ======================================================

const PERMISSION_GROUPS = [
  {
    title: "Books",
    fields: [
      ["bookView", "View"],
      ["bookCreate", "Create"],
      ["bookUpdate", "Update"],
      ["bookDelete", "Delete"],
    ],
  },

  {
    title: "Members",
    fields: [
      ["memberView", "View"],
      ["memberCreate", "Create"],
      ["memberUpdate", "Update"],
      ["memberDelete", "Delete"],
    ],
  },

  {
    title: "Categories",
    fields: [
      ["categoryView", "View"],
      ["categoryCreate", "Create"],
      ["categoryUpdate", "Update"],
      ["categoryDelete", "Delete"],
    ],
  },

  {
    title: "Wallet",
    fields: [
      ["walletView", "View"],
      ["walletManage", "Manage"],
    ],
  },

  {
    title: "Rental",
    fields: [
      ["rentalView", "View"],
      ["rentalCreate", "Create"],
      ["rentalReturn", "Return"],
    ],
  },

  {
    title: "Reservation",
    fields: [
      ["reservationView", "View"],
      ["reservationManage", "Manage"],
    ],
  },

  {
    title: "Dashboard / Reports",
    fields: [
      ["dashboardView", "Dashboard"],
      ["reportView", "Reports"],
    ],
  },
];

// ======================================================
// PAGE
// ======================================================

export default function LibrariansPage() {
  // ====================================================
  // STATES
  // ====================================================

  const [librarians, setLibrarians] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  // ====================================================
  // CREATE MODAL
  // ====================================================

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  // ====================================================
  // PERMISSION MODAL
  // ====================================================

  const [showPermissionModal, setShowPermissionModal] =
    useState(false);

  const [selectedLibrarian, setSelectedLibrarian] =
    useState(null);

  // ====================================================
  // CREATE FORM
  // ====================================================

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    permissions: {
      ...DEFAULT_PERMISSIONS,
    },
  });

  // ====================================================
  // LOAD LIBRARIANS
  // ====================================================

  const loadLibrarians = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLibrarians();

      console.log(
        "Librarian API Response:",
        response
      );

      setLibrarians(
        response?.data?.librarians || []
      );
    } catch (error) {
      console.error(
        "Get librarians error:",
        error
      );

      setLibrarians([]);

      setError(
        error?.message ||
          "Failed to load librarians"
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadLibrarians();
  }, []);

  // ====================================================
  // CLEAR MESSAGES
  // ====================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ====================================================
  // FORM INPUT
  // ====================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ====================================================
  // CREATE PERMISSION CHANGE
  // ====================================================

  const handleCreatePermissionChange = (
    field
  ) => {
    setForm((prev) => ({
      ...prev,

      permissions: {
        ...prev.permissions,

        [field]:
          !prev.permissions[field],
      },
    }));
  };

  // ====================================================
  // CREATE LIBRARIAN
  // ====================================================

  const handleCreateLibrarian = async (e) => {
    e.preventDefault();

    clearMessages();

    const name = form.name.trim();

    const email =
      form.email.trim().toLowerCase();

    const password = form.password;

    // -----------------------------------------------
    // NAME VALIDATION
    // -----------------------------------------------

    if (!name) {
      setError("Name is required");
      return;
    }

    if (name.length < 2) {
      setError(
        "Name must be at least 2 characters"
      );
      return;
    }

    // -----------------------------------------------
    // EMAIL VALIDATION
    // -----------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!emailRegex.test(email)) {
      setError(
        "Please enter a valid email address"
      );
      return;
    }

    // -----------------------------------------------
    // PASSWORD VALIDATION
    // -----------------------------------------------

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters"
      );
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await createLibrarian({
          name,
          email,
          password,
          permissions:
            form.permissions,
        });

      console.log(
        "Create librarian response:",
        response
      );

      setSuccess(
        "Librarian created successfully"
      );

      // ---------------------------------------------
      // RESET FORM
      // ---------------------------------------------

      setForm({
        name: "",
        email: "",
        password: "",

        permissions: {
          ...DEFAULT_PERMISSIONS,
        },
      });

      setShowCreateModal(false);

      await loadLibrarians();
    } catch (error) {
      console.error(
        "Create librarian error:",
        error
      );

      setError(
        error?.message ||
          "Failed to create librarian"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ====================================================
  // OPEN PERMISSION MODAL
  // ====================================================

  const openPermissionModal = (
    librarian
  ) => {
    clearMessages();

    setSelectedLibrarian({
      ...librarian,

      permissions: {
        ...DEFAULT_PERMISSIONS,

        ...(librarian.permissions || {}),
      },
    });

    setShowPermissionModal(true);
  };

  // ====================================================
  // PERMISSION CHANGE
  // ====================================================

  const handlePermissionChange = (
    field
  ) => {
    setSelectedLibrarian((prev) => ({
      ...prev,

      permissions: {
        ...prev.permissions,

        [field]:
          !prev.permissions[field],
      },
    }));
  };

  // ====================================================
  // UPDATE PERMISSIONS
  // ====================================================

  const handleUpdatePermissions =
    async () => {
      if (!selectedLibrarian) {
        return;
      }

      clearMessages();

      try {
        setActionLoading(true);

        await updateLibrarianPermissions(
          selectedLibrarian.id,

          selectedLibrarian.permissions
        );

        setSuccess(
          "Permissions updated successfully"
        );

        setShowPermissionModal(false);

        setSelectedLibrarian(null);

        await loadLibrarians();
      } catch (error) {
        console.error(
          "Update permissions error:",
          error
        );

        setError(
          error?.message ||
            "Failed to update permissions"
        );
      } finally {
        setActionLoading(false);
      }
    };

  // ====================================================
  // ACTIVATE
  // ====================================================

  const handleActivate = async (
    librarianId
  ) => {
    clearMessages();

    try {
      setActionLoading(true);

      await activateLibrarian(
        librarianId
      );

      setSuccess(
        "Librarian activated successfully"
      );

      await loadLibrarians();
    } catch (error) {
      console.error(
        "Activate librarian error:",
        error
      );

      setError(
        error?.message ||
          "Failed to activate librarian"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ====================================================
  // DEACTIVATE
  // ====================================================

  const handleDeactivate = async (
    librarianId
  ) => {
    clearMessages();

    try {
      setActionLoading(true);

      await deactivateLibrarian(
        librarianId
      );

      setSuccess(
        "Librarian deactivated successfully"
      );

      await loadLibrarians();
    } catch (error) {
      console.error(
        "Deactivate librarian error:",
        error
      );

      setError(
        error?.message ||
          "Failed to deactivate librarian"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ====================================================
  // SEARCH
  // ====================================================

  const filteredLibrarians = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    if (!searchValue) {
      return librarians;
    }

    return librarians.filter(
      (librarian) =>
        librarian.name
          ?.toLowerCase()
          .includes(searchValue) ||
        librarian.email
          ?.toLowerCase()
          .includes(searchValue)
    );
  }, [librarians, search]);

  // ====================================================
  // STATS
  // ====================================================

  const totalLibrarians =
    librarians.length;

  const activeLibrarians =
    librarians.filter(
      (item) =>
        item.status === "ACTIVE"
    ).length;

  const inactiveLibrarians =
    librarians.filter(
      (item) =>
        item.status === "INACTIVE"
    ).length;

  // ====================================================
  // SELECT ALL CREATE PERMISSIONS
  // ====================================================

  const selectAllCreatePermissions =
    () => {
      const permissions = {};

      Object.keys(
        DEFAULT_PERMISSIONS
      ).forEach((key) => {
        permissions[key] = true;
      });

      setForm((prev) => ({
        ...prev,
        permissions,
      }));
    };

  // ====================================================
  // CLEAR CREATE PERMISSIONS
  // ====================================================

  const clearCreatePermissions = () => {
    setForm((prev) => ({
      ...prev,

      permissions: {
        ...DEFAULT_PERMISSIONS,
      },
    }));
  };

  // ====================================================
  // SELECT ALL EDIT PERMISSIONS
  // ====================================================

  const selectAllEditPermissions =
    () => {
      if (!selectedLibrarian) {
        return;
      }

      const permissions = {};

      Object.keys(
        DEFAULT_PERMISSIONS
      ).forEach((key) => {
        permissions[key] = true;
      });

      setSelectedLibrarian(
        (prev) => ({
          ...prev,

          permissions,
        })
      );
    };

  // ====================================================
  // CLEAR EDIT PERMISSIONS
  // ====================================================

  const clearEditPermissions = () => {
    if (!selectedLibrarian) {
      return;
    }

    setSelectedLibrarian(
      (prev) => ({
        ...prev,

        permissions: {
          ...DEFAULT_PERMISSIONS,
        },
      })
    );
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Librarians
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage librarians and their
              permissions.
            </p>
          </div>

          <button
            onClick={() => {
              clearMessages();

              setShowCreateModal(
                true
              );
            }}
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            + Create Librarian
          </button>
        </div>

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Librarians
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalLibrarians}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {activeLibrarians}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Inactive
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {inactiveLibrarians}
            </p>
          </div>

        </div>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
          />

        </div>

        {/* ==================================================
            TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading librarians...
            </div>
          ) : filteredLibrarians.length ===
            0 ? (
            <div className="p-10 text-center">

              <p className="text-lg font-semibold text-slate-700">
                No librarians found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Create a librarian to get
                started.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Librarian
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Created
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredLibrarians.map(
                    (librarian) => (
                      <tr
                        key={
                          librarian.id
                        }
                        className="hover:bg-slate-50"
                      >

                        {/* NAME */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                              {librarian.name
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase()}
                            </div>

                            <div>

                              <p className="font-semibold text-slate-900">
                                {
                                  librarian.name
                                }
                              </p>

                              <p className="text-xs text-slate-400">
                                ID:{" "}
                                {
                                  librarian.id
                                }
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* EMAIL */}

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {
                            librarian.email
                          }
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">

                          {librarian.status ===
                          "ACTIVE" ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              INACTIVE
                            </span>
                          )}

                        </td>

                        {/* CREATED */}

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {librarian.createdAt
                            ? new Date(
                                librarian.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                openPermissionModal(
                                  librarian
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              Permissions
                            </button>

                            {librarian.status ===
                            "ACTIVE" ? (
                              <button
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  handleDeactivate(
                                    librarian.id
                                  )
                                }
                                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  handleActivate(
                                    librarian.id
                                  )
                                }
                                className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-600 hover:bg-green-100 disabled:opacity-50"
                              >
                                Activate
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

      {/* ====================================================
          CREATE MODAL
      ==================================================== */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Create Librarian
                </h2>

                <p className="text-sm text-slate-500">
                  Create account and assign
                  permissions.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCreateModal(
                    false
                  )
                }
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleCreateLibrarian
              }
              className="p-6"
            >

              {/* BASIC INFO */}

              <div className="grid gap-4 md:grid-cols-3">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter email"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                  />
                </div>

              </div>

              {/* PERMISSION HEADER */}

              <div className="mt-8 flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Permissions
                  </h3>

                  <p className="text-sm text-slate-500">
                    Select what this librarian
                    can access.
                  </p>
                </div>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={
                      selectAllCreatePermissions
                    }
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    onClick={
                      clearCreatePermissions
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    Clear All
                  </button>

                </div>

              </div>

              {/* PERMISSION GROUPS */}

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                {PERMISSION_GROUPS.map(
                  (group) => (
                    <div
                      key={
                        group.title
                      }
                      className="rounded-xl border border-slate-200 p-4"
                    >

                      <h4 className="mb-3 font-bold text-slate-800">
                        {group.title}
                      </h4>

                      <div className="grid grid-cols-2 gap-3">

                        {group.fields.map(
                          ([
                            field,
                            label,
                          ]) => (
                            <label
                              key={field}
                              className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
                            >

                              <input
                                type="checkbox"
                                checked={
                                  form
                                    .permissions[
                                    field
                                  ]
                                }
                                onChange={() =>
                                  handleCreatePermissionChange(
                                    field
                                  )
                                }
                                className="h-4 w-4"
                              />

                              {label}

                            </label>
                          )
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>

              {/* FOOTER */}

              <div className="mt-8 flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(
                      false
                    )
                  }
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    actionLoading
                  }
                  className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading
                    ? "Creating..."
                    : "Create Librarian"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ====================================================
          PERMISSIONS MODAL
      ==================================================== */}

      {showPermissionModal &&
        selectedLibrarian && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Manage Permissions
                  </h2>

                  <p className="text-sm text-slate-500">
                    {
                      selectedLibrarian.name
                    }{" "}
                    —{" "}
                    {
                      selectedLibrarian.email
                    }
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowPermissionModal(
                      false
                    );

                    setSelectedLibrarian(
                      null
                    );
                  }}
                  className="text-2xl text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>

              </div>

              {/* PERMISSION CONTENT */}

              <div className="p-6">

                {/* ACTIONS */}

                <div className="mb-5 flex justify-end gap-2">

                  <button
                    type="button"
                    onClick={
                      selectAllEditPermissions
                    }
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    onClick={
                      clearEditPermissions
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    Clear All
                  </button>

                </div>

                {/* GROUPS */}

                <div className="grid gap-4 md:grid-cols-2">

                  {PERMISSION_GROUPS.map(
                    (group) => (
                      <div
                        key={
                          group.title
                        }
                        className="rounded-xl border border-slate-200 p-4"
                      >

                        <h4 className="mb-3 font-bold text-slate-800">
                          {group.title}
                        </h4>

                        <div className="grid grid-cols-2 gap-3">

                          {group.fields.map(
                            ([
                              field,
                              label,
                            ]) => (
                              <label
                                key={field}
                                className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
                              >

                                <input
                                  type="checkbox"
                                  checked={
                                    Boolean(
                                      selectedLibrarian
                                        .permissions?.[
                                        field
                                      ]
                                    )
                                  }
                                  onChange={() =>
                                    handlePermissionChange(
                                      field
                                    )
                                  }
                                  className="h-4 w-4"
                                />

                                {label}

                              </label>
                            )
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>

                {/* FOOTER */}

                <div className="mt-8 flex justify-end gap-3 border-t pt-5">

                  <button
                    type="button"
                    onClick={() => {
                      setShowPermissionModal(
                        false
                      );

                      setSelectedLibrarian(
                        null
                      );
                    }}
                    className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={
                      handleUpdatePermissions
                    }
                    className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Saving..."
                      : "Save Permissions"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}
    </div>
  );
}