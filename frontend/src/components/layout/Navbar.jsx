"use client";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Left */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Dashboard
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">
            {user?.name || "User"}
          </p>

          <p className="text-xs text-slate-500">
            {user?.role || ""}
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}