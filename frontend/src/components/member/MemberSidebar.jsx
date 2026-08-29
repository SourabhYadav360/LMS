"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    href: "/member",
    icon: "📊",
  },
  {
    label: "Books",
    href: "/member/books",
    icon: "📚",
  },
  {
    label: "Rentals",
    href: "/member/rentals",
    icon: "🔄",
  },
  {
    label: "Reservations",
    href: "/member/reservations",
    icon: "📋",
  },
  {
    label: "Wallet",
    href: "/member/wallet",
    icon: "💰",
  },
  {
    label: "Profile",
    href: "/member/profile",
    icon: "👤",
  },
];

export default function MemberSidebar({
  user,
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-blue-100 bg-white">

      {/* LOGO */}

      <div className="flex h-20 items-center border-b border-blue-100 px-6">
        <div>
          <h1 className="text-xl font-bold text-blue-900">
            Library
          </h1>

          <p className="text-xs text-blue-500">
            Member Portal
          </p>
        </div>
      </div>

      {/* MENU */}

      <nav className="flex-1 overflow-y-auto p-4">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-blue-400">
          Navigation
        </p>

        <div className="space-y-1">

          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`
              );

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
            {user?.name || "Member"}
          </p>
        </div>
      </div>

    </aside>
  );
}
