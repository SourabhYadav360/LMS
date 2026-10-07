"use client";

import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://lms-uh6q.onrender.com/api",

  headers: {
    "Content-Type": "application/json",
  },

  // Cookie automatically backend ko send hogi
  withCredentials: true,
});

export default api;