"use client";

import { useEffect, useState } from "react";

import { getMe } from "@/services/auth.service";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getMe();

        setUser(response.data.user);
      } catch (error) {
        console.error(error);
      }
    };

    loadUser();
  }, []);

  return (
    <header className="h-16 bg-white border-b border-blue-100 flex items-center justify-between px-6">
      <div>
        <h2 className="font-semibold text-blue-900">
          Dashboard
        </h2>
      </div>

      <div className="text-right">
        <p className="font-medium text-blue-900">
          {user?.name || "Admin"}
        </p>

        <p className="text-sm text-blue-500">
          {user?.role === "SUPER_ADMIN" ? "Super Admin" : user?.role || "SUPER_ADMIN"}
        </p>
      </div>
    </header>
  );
}