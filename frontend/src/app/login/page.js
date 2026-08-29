"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const response = await login(
        email,
        password
      );

      const user = response.data.user;

      // ========================================
      // ROLE BASED REDIRECT
      // ========================================

      if (user.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else if (user.role === "LIBRARIAN") {
        router.push("/librarian");
      } else if (user.role === "MEMBER") {
        router.push("/member");
      } else {
        setError("Invalid user role");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6">

        <h1 className="text-3xl font-bold mb-6">
          Library Login
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* EMAIL */}

          <div>
            <label className="block mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter email"
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label className="block mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          {/* ERROR */}

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-2"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}