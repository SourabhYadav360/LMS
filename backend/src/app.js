"use strict";

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// ======================================================
// ROUTES
// ======================================================

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const categoryRoutes = require("./routes/category.routes");
const bookRoutes = require("./routes/book.routes");
const walletRoutes = require("./routes/wallet.routes");
const rentalRoutes = require("./routes/rental.routes");
const librarianRoutes = require("./routes/librarians.routes");
const memberRoutes = require("./routes/member.routes");
const reservationRoutes = require("./routes/reservation.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();

// ======================================================
// CORS
// ======================================================

const normalizeOrigin = (origin) => {
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
};

const allowedOrigins = new Set([
  "http://localhost:3000",
  "https://lms-beta-rosy-10.vercel.app",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.has(normalizeOrigin(origin)));
    },
    credentials: true,
  })
);

// ======================================================
// BODY PARSER
// ======================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ======================================================
// COOKIE PARSER
// ======================================================

app.use(cookieParser());

// ======================================================
// AUTH ROUTES
// ======================================================

app.use(
  "/api/auth",
  authRoutes
);

// ======================================================
// ADMIN ROUTES
// ======================================================

app.use(
  "/api/admin",
  adminRoutes
);

// ======================================================
// CATEGORY ROUTES
// ======================================================

app.use(
  "/api/categories",
  categoryRoutes
);

// ======================================================
// BOOK ROUTES
// ======================================================

app.use(
  "/api/books",
  bookRoutes
);

// ======================================================
// WALLET ROUTES
// ======================================================

app.use(
  "/api/wallet",
  walletRoutes
);

// ======================================================
// RENTAL ROUTES
// ======================================================

app.use(
  "/api/rentals",
  rentalRoutes
);

// ======================================================
// RESERVATION ROUTES
// ======================================================

app.use(
  "/api/reservations",
  reservationRoutes
);

// ======================================================
// LIBRARIAN ROUTES
// ======================================================

app.use(
  "/api/librarians",
  librarianRoutes
);

// ======================================================
// MEMBER ROUTES
// ======================================================

app.use(
  "/api/members",
  memberRoutes
);

// ======================================================
// REPORT ROUTES
// ======================================================

app.use(
  "/api/reports",
  reportRoutes
);

// ======================================================
// ROOT / TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Library API is running",
  });
});

// ======================================================
// ERROR HANDLER
// ======================================================

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

// ======================================================
// EXPORT
// ======================================================

module.exports = app;