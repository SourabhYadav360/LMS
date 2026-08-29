"use strict";

const authorizeSuperAdmin = (req, res, next) => {
  try {
    // authenticate middleware ke baad req.user available hona chahiye
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Sirf SUPER_ADMIN allowed
    if (req.user.type !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can perform this action",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorizeSuperAdmin,
};