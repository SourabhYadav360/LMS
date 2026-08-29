const { body, param } = require("express-validator");

const createLibrarianValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage(
      "Password must be at least 8 characters long"
    ),
];


const updateLibrarianValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid librarian ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Name must be between 2 and 100 characters"
    ),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage(
      "Password must be at least 8 characters long"
    ),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage(
      "Status must be ACTIVE or INACTIVE"
    ),
];


const librarianIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid librarian ID"),
];


module.exports = {
  createLibrarianValidator,
  updateLibrarianValidator,
  librarianIdValidator,
};