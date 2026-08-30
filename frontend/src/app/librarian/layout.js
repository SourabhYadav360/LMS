"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMe } from "@/services/auth.service";

import LibrarianSidebar from "@/components/librarian/LibrarianSidebar";
import LibrarianNavbar from "@/components/librarian/LibrarianNavbar";

export default function LibrarianLayout({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getMe();

        console.log("GET ME RESPONSE:", response);

        // Backend response:
        // {
        //   success: true,
        //   data: {
        //     user: {...}
        //   }
        // }

        const currentUser = response?.data?.user;

        console.log("CURRENT USER:", currentUser);

        // User nahi mila
        if (!currentUser) {
          router.replace("/login");
          return;
        }

        // Sirf LIBRARIAN ko access
        if (currentUser.role !== "LIBRARIAN") {
          router.replace("/login");
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error("Get user error:", error);

        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <p className="mt-4 text-sm text-gray-500">
            Loading librarian dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // USER NOT FOUND
  // ==========================================

  if (!user) {
    return null;
  }

  // ==========================================
  // LIBRARIAN LAYOUT
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed Position */}
      <LibrarianSidebar
        permissions={user.permissions || {}}
        user={user}
      />

      {/* Navbar - Fixed Position */}
      <LibrarianNavbar user={user} />

      {/* Page Content - Main content area with proper margins */}
      <main className="ml-64 pt-20 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}