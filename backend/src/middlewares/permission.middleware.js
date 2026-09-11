"use strict";

const {Librarian,} = require("../models");

const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      // User authenticated hai ya nahi
      if (!req.user) {
        const error = new Error("Authentication required");
        error.statusCode = 401;
        throw error;
      }

      const { userId, role } = req.user;

      // Super Admin ko sab permissions
      if (role === "SUPER_ADMIN") {
        return next();
      }

      // Member permissions
      if (role === "MEMBER") {
        const allowedPermissions = [
          "bookView",
          "dashboardView",
          "rentalCreate",
          "rentalView",
          "rentalReturn",
          "reservationCreate",
          "reservationView",
          "walletView",
        ];

        if (!allowedPermissions.includes(permission)) {
          const error = new Error(
            "You do not have permission to perform this action"
          );
          error.statusCode = 403;
          throw error;
        }

        return next();
      }

      // Librarian permissions
      if (role === "LIBRARIAN") {
        const librarian = await Librarian.findByPk(userId);

        if (!librarian) {
          const error = new Error("Librarian not found");
          error.statusCode = 404;
          throw error;
        }

        if (!librarian[permission]) {
          const error = new Error(
            `You do not have ${permission} permission`
          );
          error.statusCode = 403;
          throw error;
        }

        return next();
      }

      const error = new Error("Invalid user role");
      error.statusCode = 403;
      throw error;
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requirePermission,
};