"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMe } from "@/services/auth.service";

import MemberSidebar from "@/components/member/MemberSidebar";
import MemberNavbar from "@/components/member/MemberNavbar";

export default function MemberLayout({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getMe();

        console.log("GET ME RESPONSE:", response);

        const currentUser =
          response?.data?.user ||
          response?.user ||
          null;

        console.log("CURRENT USER:", currentUser);

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (currentUser.role !== "MEMBER") {
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-900" />

          <p className="mt-4 text-sm text-gray-500">
            Loading member dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <MemberSidebar user={user} />

      {/* RIGHT SIDE */}
      <div className="ml-64 min-h-screen">

        {/* NAVBAR */}
        <MemberNavbar user={user} />

        {/* PAGE CONTENT */}
        <main className="pt-20 p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}