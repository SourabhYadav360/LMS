"use strict";

const jwt = require("jsonwebtoken");

const {
  Librarian,
  Member,
} = require("../models");

// ======================================================
// AUTHENTICATE
// ======================================================

const authenticate = async (req, res, next) => {
  try {
    // ==================================================
    // GET TOKEN FROM HTTP-ONLY COOKIE
    // ==================================================

    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    // ==================================================
    // VERIFY JWT
    // ==================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ==================================================
    // VALIDATE TOKEN
    // ==================================================

    if (!decoded.userId || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // ==================================================
    // SUPER ADMIN
    // ==================================================

    if (decoded.role === "SUPER_ADMIN") {
      req.user = {
        userId: decoded.userId,
        role: "SUPER_ADMIN",
      };

      return next();
    }

    // ==================================================
    // LIBRARIAN
    // ==================================================

    if (decoded.role === "LIBRARIAN") {
      const librarian = await Librarian.findByPk(
        decoded.userId,
        {
          attributes: {
            exclude: ["password"],
          },
        }
      );

      if (!librarian) {
        return res.status(401).json({
          success: false,
          message: "Librarian account not found",
        });
      }

      // ==================================================
      // ATTACH LIBRARIAN + PERMISSIONS
      // ==================================================

      req.user = {
        userId: librarian.id,

        // IMPORTANT
        // Librarian model me role field nahi hai
        role: "LIBRARIAN",

        // BOOK
        bookView: librarian.bookView,
        bookCreate: librarian.bookCreate,
        bookUpdate: librarian.bookUpdate,
        bookDelete: librarian.bookDelete,

        // MEMBER
        memberView: librarian.memberView,
        memberCreate: librarian.memberCreate,
        memberUpdate: librarian.memberUpdate,
        memberDelete: librarian.memberDelete,

        // CATEGORY
        categoryView: librarian.categoryView,
        categoryCreate: librarian.categoryCreate,
        categoryUpdate: librarian.categoryUpdate,
        categoryDelete: librarian.categoryDelete,

        // WALLET
        walletView: librarian.walletView,
        walletManage: librarian.walletManage,

        // RENTAL
        rentalView: librarian.rentalView,
        rentalCreate: librarian.rentalCreate,
        rentalReturn: librarian.rentalReturn,

        // RESERVATION
        reservationView: librarian.reservationView,
        reservationManage: librarian.reservationManage,

        // DASHBOARD
        dashboardView: librarian.dashboardView,
        reportView: librarian.reportView,
      };

      return next();
    }

    // ==================================================
    // MEMBER
    // ==================================================

    if (decoded.role === "MEMBER") {
      const member = await Member.findByPk(
        decoded.userId,
        {
          attributes: {
            exclude: ["password"],
          },
        }
      );

      if (!member) {
        return res.status(401).json({
          success: false,
          message: "Member account not found",
        });
      }

      req.user = {
        userId: member.id,
        role: "MEMBER",
      };

      return next();
    }

    // ==================================================
    // UNKNOWN ROLE
    // ==================================================

    return res.status(403).json({
      success: false,
      message: "Invalid user role",
    });

  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = authenticate;