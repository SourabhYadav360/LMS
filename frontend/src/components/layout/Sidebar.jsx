"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const menuByRole = {
    SUPER_ADMIN: [
      { name: "Dashboard", path: "/admin" },
      { name: "Books", path: "/admin/books" },
      { name: "Categories", path: "/admin/categories" },
      { name: "Members", path: "/admin/members" },
      { name: "Librarians", path: "/admin/librarians" },
      { name: "Rentals", path: "/admin/rentals" },
      { name: "Reservations", path: "/admin/reservations" },
      { name: "Wallets", path: "/admin/wallets" },
      { name: "Reports", path: "/admin/reports" },
    ],

    LIBRARIAN: [
      { name: "Dashboard", path: "/librarian" },
      { name: "Books", path: "/librarian/books", permission: "bookView" },
      { name: "Categories", path: "/librarian/categories", permission: "categoryView" },
      { name: "Members", path: "/librarian/members", permission: "memberView" },
      { name: "Rentals", path: "/librarian/rentals", permission: "rentalView" },
      { name: "Reservations", path: "/librarian/reservations", permission: "reservationView" },
      { name: "Wallets", path: "/librarian/wallets", permission: "walletView" },
      { name: "Reports", path: "/librarian/reports", permission: "reportView" },
      { name: "Profile", path: "/librarian/profile" },
    ],

    MEMBER: [
      { name: "Dashboard", path: "/member" },
      { name: "Books", path: "/member/books" },
      { name: "My Rentals", path: "/member/rentals" },
      { name: "My Reservations", path: "/member/reservations" },
      { name: "My Wallet", path: "/member/wallet" },
      { name: "Profile", path: "/member/profile" },
    ],
  };

  const menuItems = (menuByRole[user?.role] || []).filter(
    (item) => !item.permission || user?.permissions?.[item.permission] || user?.[item.permission]
  );

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-5">
        <h1 className="text-xl font-bold">
          Library Management
        </h1>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`block rounded-lg px-4 py-3 transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}