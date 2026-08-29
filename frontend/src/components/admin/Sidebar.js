"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin",
  },
  {
    name: "Librarians",
    path: "/admin/librarians",
  },
  {
    name: "Members",
    path: "/admin/members",
  },
  {
    name: "Books",
    path: "/admin/books",
  },
  {
    name: "Categories",
    path: "/admin/categories",
  },
  {
    name: "Wallets",
    path: "/admin/wallets",
  },
  {
    name: "Reservations",
    path: "/admin/reservations",
  },
  {
    name: "Reports",
    path: "/admin/reports",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-blue-100">
      <div className="p-6 border-b border-blue-100">
        <h1 className="text-xl font-bold text-blue-900">
          Library Admin
        </h1>
        <p className="text-xs text-blue-500 mt-1">
          Super Admin Panel
        </p>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const active =
            pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-4 py-3 rounded-lg transition ${
                active
                  ? "bg-blue-900 text-white"
                  : "text-blue-700 hover:bg-blue-50 hover:text-blue-900"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}