"use client";

import { useRouter } from "next/navigation";

import { logout } from "@/services/auth.service";

export default function MemberNavbar({
  user,
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-20 items-center justify-between border-b border-blue-100 bg-white px-8">

      {/* LEFT */}

      <div>
        <p className="text-sm text-blue-500">
          Welcome back
        </p>

        <h2 className="text-lg font-semibold text-blue-900">
          {user?.name || "Member"}
        </h2>
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-4">

        {/* USER */}

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
            {user?.name
              ?.charAt(0)
              ?.toUpperCase() || "M"}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-blue-900">
              {user?.name || "Member"}
            </p>

            <p className="text-xs text-blue-500">
              Member
            </p>
          </div>

        </div>

        {/* LOGOUT */}

        <button
          onClick={handleLogout}
          className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          Logout
        </button>

      </div>

    </header>
  );
}
