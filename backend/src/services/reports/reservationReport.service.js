"use strict";

const {
  Reservation,
  Member,
  Book,
} = require("../../models");

const { Op } = require("sequelize");

const getReservationReport = async ({
  fromDate,
  toDate,
} = {}) => {
  const where = {};

  // ==========================================
  // DATE FILTER
  // ==========================================

  if (fromDate || toDate) {
    where.reservedAt = {};

    if (fromDate) {
      where.reservedAt[Op.gte] =
        new Date(fromDate);
    }

    if (toDate) {
      where.reservedAt[Op.lte] =
        new Date(toDate);
    }
  }

  // ==========================================
  // GET RESERVATIONS
  // ==========================================

  const reservations =
    await Reservation.findAll({
      where,

      include: [
        {
          model: Member,
          as: "member",
          attributes: [
            "id",
            "name",
            "email",
          ],
        },

        {
          model: Book,
          as: "book",
          attributes: [
            "id",
            "title",
            "author",
            "isbn",
          ],
        },
      ],

      order: [
        ["reservedAt", "DESC"],
      ],
    });

  // ==========================================
  // STATUS COUNTS
  // ==========================================

  const totalReservations =
    reservations.length;

  const pendingReservations =
    reservations.filter(
      (reservation) =>
        reservation.status ===
        "PENDING"
    ).length;

  const approvedReservations =
    reservations.filter(
      (reservation) =>
        reservation.status ===
        "APPROVED"
    ).length;

  const rejectedReservations =
    reservations.filter(
      (reservation) =>
        reservation.status ===
        "REJECTED"
    ).length;

  const cancelledReservations =
    reservations.filter(
      (reservation) =>
        reservation.status ===
        "CANCELLED"
    ).length;

  const completedReservations =
    reservations.filter(
      (reservation) =>
        reservation.status ===
        "COMPLETED"
    ).length;

  const expiredReservations =
    reservations.filter(
      (reservation) =>
        reservation.status ===
        "EXPIRED"
    ).length;

  return {
    summary: {
      totalReservations,

      pendingReservations,

      approvedReservations,

      rejectedReservations,

      cancelledReservations,

      completedReservations,

      expiredReservations,
    },

    reservations:
      reservations.map(
        (reservation) => ({
          id: reservation.id,

          member:
            reservation.member
              ? {
                  id:
                    reservation
                      .member.id,

                  name:
                    reservation
                      .member.name,

                  email:
                    reservation
                      .member.email,
                }
              : null,

          book:
            reservation.book
              ? {
                  id:
                    reservation
                      .book.id,

                  title:
                    reservation
                      .book.title,

                  author:
                    reservation
                      .book.author,

                  isbn:
                    reservation
                      .book.isbn,
                }
              : null,

          reservedAt:
            reservation.reservedAt,

          expiresAt:
            reservation.expiresAt,

          approvedAt:
            reservation.approvedAt,

          rejectedAt:
            reservation.rejectedAt,

          cancelledAt:
            reservation.cancelledAt,

          completedAt:
            reservation.completedAt,

          rejectionReason:
            reservation.rejectionReason,

          cancellationReason:
            reservation.cancellationReason,

          status:
            reservation.status,

          createdAt:
            reservation.createdAt,
        })
      ),
  };
};

module.exports = {
  getReservationReport,
};