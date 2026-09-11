"use strict";

const jwt = require("jsonwebtoken");
const {SuperAdmin,Librarian,Member,} = require("../models");

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.userId || !decoded.role) {
      const error = new Error("Invalid authentication token");
      error.statusCode = 401;
      throw error;
    }

    let user;

    if (decoded.role === "SUPER_ADMIN") {
      user = await SuperAdmin.findByPk(decoded.userId);
    } else if (decoded.role === "LIBRARIAN") {
      user = await Librarian.findByPk(decoded.userId);
    } else if (decoded.role === "MEMBER") {
      user = await Member.findByPk(decoded.userId);
    } else {
      const error = new Error("Invalid user role");
      error.statusCode = 401;
      throw error;
    }

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== "ACTIVE") {
      const error = new Error("User account is not active");
      error.statusCode = 403;
      throw error;
    }

    req.user = {
      userId: user.id,
      role: decoded.role,
    };

    if (decoded.role === "LIBRARIAN") {
      req.user.bookView = user.bookView;
      req.user.bookCreate = user.bookCreate;
      req.user.bookUpdate = user.bookUpdate;
      req.user.bookDelete = user.bookDelete;

      req.user.memberView = user.memberView;
      req.user.memberCreate = user.memberCreate;
      req.user.memberUpdate = user.memberUpdate;
      req.user.memberDelete = user.memberDelete;

      req.user.categoryView = user.categoryView;
      req.user.categoryCreate = user.categoryCreate;
      req.user.categoryUpdate = user.categoryUpdate;
      req.user.categoryDelete = user.categoryDelete;

      req.user.walletView = user.walletView;
      req.user.walletManage = user.walletManage;

      req.user.rentalView = user.rentalView;
      req.user.rentalCreate = user.rentalCreate;
      req.user.rentalReturn = user.rentalReturn;

      req.user.reservationView = user.reservationView;
      req.user.reservationManage = user.reservationManage;

      req.user.dashboardView = user.dashboardView;
      req.user.reportView = user.reportView;
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      error.statusCode = 401;
      error.message = "Invalid authentication token";
    }

    if (error.name === "TokenExpiredError") {
      error.statusCode = 401;
      error.message = "Authentication token expired";
    }

    next(error);
  }
};

module.exports = {
  authenticate,
};