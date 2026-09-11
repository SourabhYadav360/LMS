"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { getMe } from "@/services/auth.service";

const AuthContext = createContext(null);

const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = window.sessionStorage.getItem("lms_user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Stored user parse error:", error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const requestId = useRef(0);

  const saveUser = (nextUser) => {
    if (!nextUser) {
      setUser(null);
      window.sessionStorage.removeItem("lms_user");
      return;
    }

    setUser(nextUser);

    window.sessionStorage.setItem(
      "lms_user",
      JSON.stringify(nextUser)
    );
  };

  const loadUser = async ({ clearOnError = true } = {}) => {
    const currentRequestId = ++requestId.current;

    try {
      const response = await getMe();

      console.log("GET ME RESPONSE:", response);

   

      const currentUser =
        response?.user ||
        response?.data?.user ||
        response?.data;

      console.log("CURRENT USER:", currentUser);

      if (currentRequestId !== requestId.current) {
        return currentUser;
      }

      if (!currentUser) {
        throw new Error("User data not found from /auth/me");
      }

      saveUser(currentUser);

      return currentUser;
    } catch (error) {
      console.error("GET ME ERROR:", error);

      if (
        currentRequestId === requestId.current &&
        clearOnError
      ) {
        setUser(null);
        window.sessionStorage.removeItem("lms_user");
      }

      return null;
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = getStoredUser();

      /*
        Agar sessionStorage mein user hai,
        to UI ko immediately authenticated maan sakte hain.
      */
      if (storedUser) {
        setUser(storedUser);
      }

      /*
        Backend se actual user verify karo.
      */
      await loadUser({
        clearOnError: !storedUser,
      });
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    setUser(null);

    window.sessionStorage.removeItem("lms_user");
  };

  const setAuthenticatedUser = (nextUser) => {
    saveUser(nextUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: setAuthenticatedUser,
        loading,
        logout,
        refreshUser: () =>
          loadUser({ clearOnError: false }),
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}