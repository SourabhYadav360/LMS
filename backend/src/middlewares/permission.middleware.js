"use strict";

const { Librarian } = require("../models");

// ======================================================
// REQUIRE PERMISSION
// ======================================================

const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      // ==================================================
      // AUTH CHECK
      // ==================================================

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // ==================================================
      // SUPER ADMIN
      // ==================================================

      // Super Admin ko saari permissions allowed hain.
      if (req.user.role === "SUPER_ADMIN") {
        return next();
      }

      // ==================================================
      // MEMBER
      // ==================================================

      if (req.user.role === "MEMBER") {
        if (permission === "bookView") {
          return next();
        }

        return res.status(403).json({
          success: false,
          message: "Members do not have this permission",
        });
      }

      // ==================================================
      // LIBRARIAN
      // ==================================================

      if (req.user.role === "LIBRARIAN") {
        const librarian = await Librarian.findByPk(
          req.user.userId
        );

        if (!librarian) {
          return res.status(404).json({
            success: false,
            message: "Librarian not found",
          });
        }

        // ==================================================
        // WALLET MANAGE PERMISSION
        // ==================================================

        if (permission === "walletManage") {
          if (!librarian.walletManage) {
            return res.status(403).json({
              success: false,
              message:
                "Permission denied. walletManage is required.",
            });
          }

          return next();
        }

        // ==================================================
        // NORMAL PERMISSION CHECK
        // ==================================================

        if (!librarian[permission]) {
          return res.status(403).json({
            success: false,
            message:
              `Permission denied. ${permission} is required.`,
          });
        }

        return next();
      }

      // ==================================================
      // UNKNOWN ROLE
      // ==================================================

      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this resource",
      });
    } catch (error) {
      console.error(
        "Permission middleware error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  };
};

module.exports = requirePermission;