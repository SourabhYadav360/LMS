"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const router = useRouter();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Login nahi hai
    if (!user) {
      router.replace("/login");
      return;
    }

    // Role allowed nahi hai
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {p
      // Apne role ke dashboard par bhejo
      if (user.role === "MEMBER") {
        router.replace("/member");
      } else if (user.role === "LIBRARIAN") {
        router.replace("/librarian");
      } else if (user.role === "SUPER_ADMIN") {
        router.replace("/admin");
      }
    }
  }, [user, loading, allowedRoles, router]);

  // Jab user check ho raha hai
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">
          Loading...
        </p>
      </div>
    );
  }

  // User nahi hai
  if (!user) {
    return null;
  }

  // Wrong role
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return null;
  }

  return children;
}