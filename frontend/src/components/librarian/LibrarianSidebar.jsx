"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    href: "/librarian",
    permission: "dashboardView",
    icon: "📊",
  },
  {
    label: "Books",
    href: "/librarian/books",
    permission: "bookView",
    icon: "📚",
  },
  {
    label: "Categories",
    href: "/librarian/categories",
    permission: "categoryView",
    icon: "🗂️",
  },
  {
    label: "Members",
    href: "/librarian/members",
    permission: "memberView",
    icon: "👥",
  },
  {
    label: "Wallet",
    href: "/librarian/wallet",
    permission: "walletView",
    icon: "💰",
  },
  {
    label: "Rentals",
    href: "/librarian/rentals",
    permission: "rentalView",
    icon: "🔄",
  },
  {
    label: "Reservations",
    href: "/librarian/reservations",
    permission: "reservationView",
    icon: "📋",
  },
  {
    label: "Reports",
    href: "/librarian/reports",
    permission: "reportView",
    icon: "📈",
  },
  {
    label: "Profile",
    href: "/librarian/profile",
    icon: "👤",
  },
];

export default function LibrarianSidebar({
  permissions = {},
  user = {},
}) {
  const pathname = usePathname();

  // ================================================
  // HANDLE ALL ITEMS - SHOW DISABLED ITEMS TOO
  // ================================================
  
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-blue-100 bg-white">

      {/* LOGO */}

      <div className="flex h-20 items-center border-b border-blue-100 px-6">
        <div>
          <h1 className="text-xl font-bold text-blue-900">
            Library
          </h1>

          <p className="text-xs text-blue-500">
            Librarian Panel
          </p>
        </div>
      </div>

      {/* MENU */}

      <nav className="flex-1 overflow-y-auto p-4">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-blue-400">
          Management
        </p>

        <div className="space-y-1">

          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`
              );

            // ========================================
            // CHECK PERMISSION
            // ========================================

            const hasPermission =
              permissions[item.permission] === true;

            // ========================================
            // RENDER BASED ON PERMISSION
            // ========================================

            if (!hasPermission) {
              // DISABLED ITEM
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium cursor-not-allowed opacity-50"
                  title={`You do not have permission to access ${item.label}`}
                >
                  <span className="text-lg">
                    {item.icon}
                  </span>

                  <span className="text-blue-400">
                    {item.label}
                  </span>
                </div>
              );
            }

            // ENABLED ITEM
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-900 text-white shadow-sm"
                    : "text-blue-700 hover:bg-blue-50 hover:text-blue-900"
                }`}
              >
                <span className="text-lg">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}

        </div>

      </nav>

      {/* FOOTER */}

      <div className="border-t border-blue-100 p-4">
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-blue-500">
            Logged in as
          </p>

          <p className="mt-1 text-sm font-semibold text-blue-900">
            {user?.name || "Librarian"}
          </p>
        </div>
      </div>

    </aside>
  );
}