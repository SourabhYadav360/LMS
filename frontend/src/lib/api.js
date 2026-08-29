"use client";

const API_BASE_URL = "http://localhost:5000/api";

// ======================================================
// COMMON API FUNCTION
// ======================================================

const api = async (endpoint, options = {}) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,

        // HTTP-only cookie backend ko bhejne ke liye
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      }
    );

    // ==================================================
    // RESPONSE CONTENT TYPE
    // ==================================================

    const contentType =
      response.headers.get("content-type") || "";

    // ==================================================
    // JSON RESPONSE
    // ==================================================

    if (contentType.includes("application/json")) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Something went wrong"
        );
      }

      return data;
    }

    // ==================================================
    // NON JSON RESPONSE
    // ==================================================

    const text = await response.text();

    console.error(
      "Non-JSON API Response:",
      {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        response: text,
      }
    );

    throw new Error(
      `API returned non-JSON response (${response.status}).`
    );
  } catch (error) {
    console.error(
      `API Error [${endpoint}]:`,
      error
    );

    throw error;
  }
};

export default api;