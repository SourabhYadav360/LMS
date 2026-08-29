"use strict";

const bcrypt = require("bcrypt");

const {
  Member,
  MemberWallet,
  Rental,
  Reservation,
} = require("../models");

// ======================================================
// GET ALL MEMBERS
// ======================================================

const getMembers = async () => {
  return await Member.findAll({
    attributes: {
      exclude: ["password"],
    },

    include: [
      {
        model: MemberWallet,
        as: "wallet",
      },
      {
        model: Rental,
        as: "rentals",
      },
      {
        model: Reservation,
        as: "reservations",
      },
    ],

    order: [["createdAt", "DESC"]],
  });
};

// ======================================================
// GET MEMBER BY ID
// ======================================================

const getMemberById = async (memberId) => {
  const member = await Member.findByPk(memberId, {
    attributes: {
      exclude: ["password"],
    },

    include: [
      {
        model: MemberWallet,
        as: "wallet",
      },
      {
        model: Rental,
        as: "rentals",
      },
      {
        model: Reservation,
        as: "reservations",
      },
    ],
  });

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  return member;
};

// ======================================================
// CREATE MEMBER
// ======================================================

const createMember = async ({
  name,
  email,
  password,
}) => {
  // ----------------------------------------------------
  // REQUIRED FIELDS
  // ----------------------------------------------------

  if (!name || !email || !password) {
    const error = new Error(
      "Name, email and password are required"
    );

    error.statusCode = 400;
    throw error;
  }

  // ----------------------------------------------------
  // NORMALIZE DATA
  // ----------------------------------------------------

  const normalizedName = name.trim();

  const normalizedEmail =
    email.trim().toLowerCase();

  // ----------------------------------------------------
  // VALIDATE NAME
  // ----------------------------------------------------

  if (normalizedName.length < 2) {
    const error = new Error(
      "Member name must be at least 2 characters"
    );

    error.statusCode = 400;
    throw error;
  }

  // ----------------------------------------------------
  // VALIDATE EMAIL
  // ----------------------------------------------------

  if (!normalizedEmail.includes("@")) {
    const error = new Error(
      "Please enter a valid email"
    );

    error.statusCode = 400;
    throw error;
  }

  // ----------------------------------------------------
  // VALIDATE PASSWORD
  // ----------------------------------------------------

  if (password.length < 6) {
    const error = new Error(
      "Password must be at least 6 characters"
    );

    error.statusCode = 400;
    throw error;
  }

  // ----------------------------------------------------
  // CHECK DUPLICATE EMAIL
  // ----------------------------------------------------

  const existingMember =
    await Member.findOne({
      where: {
        email: normalizedEmail,
      },
    });

  if (existingMember) {
    const error = new Error(
      "Member with this email already exists"
    );

    error.statusCode = 409;
    throw error;
  }

  // ----------------------------------------------------
  // HASH PASSWORD
  // ----------------------------------------------------

  const hashedPassword =
    await bcrypt.hash(password, 10);

  // ----------------------------------------------------
  // CREATE MEMBER
  // ----------------------------------------------------

  const member = await Member.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    status: "ACTIVE",
  });

  // ----------------------------------------------------
  // CREATE MEMBER WALLET
  // ----------------------------------------------------

  await MemberWallet.create({
    memberId: member.id,
    balance: 0,
  });

  // ----------------------------------------------------
  // RETURN MEMBER
  // ----------------------------------------------------

  return await getMemberById(member.id);
};

// ======================================================
// UPDATE MEMBER
// ======================================================

const updateMember = async (
  memberId,
  { name, email, status }
) => {
  const member = await Member.findByPk(memberId);

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  // ----------------------------------------------------
  // NAME
  // ----------------------------------------------------

  if (name !== undefined) {
    const normalizedName = name.trim();

    if (normalizedName.length < 2) {
      const error = new Error(
        "Member name must be at least 2 characters"
      );

      error.statusCode = 400;
      throw error;
    }

    updateData.name = normalizedName;
  }

  // ----------------------------------------------------
  // EMAIL
  // ----------------------------------------------------

  if (email !== undefined) {
    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail.includes("@")) {
      const error = new Error(
        "Please enter a valid email"
      );

      error.statusCode = 400;
      throw error;
    }

    const existingMember =
      await Member.findOne({
        where: {
          email: normalizedEmail,
        },
      });

    if (
      existingMember &&
      existingMember.id !== member.id
    ) {
      const error = new Error(
        "Member with this email already exists"
      );

      error.statusCode = 409;
      throw error;
    }

    updateData.email = normalizedEmail;
  }

  // ----------------------------------------------------
  // STATUS
  // ----------------------------------------------------

  if (status !== undefined) {
    if (
      !["ACTIVE", "INACTIVE"].includes(status)
    ) {
      const error = new Error(
        "Invalid member status"
      );

      error.statusCode = 400;
      throw error;
    }

    updateData.status = status;
  }

  // ----------------------------------------------------
  // UPDATE
  // ----------------------------------------------------

  await member.update(updateData);

  return await getMemberById(member.id);
};

// ======================================================
// DELETE MEMBER
// ======================================================

const deleteMember = async (memberId) => {
  const member = await Member.findByPk(memberId);

  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  // ----------------------------------------------------
  // CHECK ACTIVE RENTALS
  // ----------------------------------------------------

  const activeRentals = await Rental.count({
    where: {
      memberId,
      status: "ACTIVE",
    },
  });

  if (activeRentals > 0) {
    const error = new Error(
      "Cannot delete member with active rentals"
    );

    error.statusCode = 400;
    throw error;
  }

  // ----------------------------------------------------
  // DELETE MEMBER
  // ----------------------------------------------------

  await member.destroy();

  return {
    id: memberId,
    message: "Member deleted successfully",
  };
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};