"use strict";

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const adminRoutes = require("./routes/admin.routes");
const categoryRoutes = require("./routes/category.routes");
const bookRoutes = require("./routes/book.routes");
const walletRoutes = require("./routes/wallet.routes");
const rentalRoutes = require("./routes/rental.routes");
const librarianRoutes = require("./routes/librarians.routes");
const memberRoutes = require("./routes/member.routes");
const reservationRoutes = require("./routes/reservation.routes");

const app = express();

// ======================================================
// CORS
// ======================================================

app.use(
  cors({
    origin: "http://localhost:3000",
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
  require("./routes/auth.routes")
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

app.use("/api/members", memberRoutes);

// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Library API is running",
  });
});



// ======================================================
// EXPORT
// ======================================================

module.exports = app;