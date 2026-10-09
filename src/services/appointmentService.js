const { prisma } = require('../lib/prisma');

async function bookAppointment(userId, slotId) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.availabilitySlot.updateMany({
      where: { id: slotId, status: 'OPEN' },
      data: { status: 'BOOKED' },
    });

    if (updated.count !== 1) {
      const err = new Error('Slot is not available for booking');
      err.statusCode = 409;
      err.expose = true;
      throw err;
    }

    const appointment = await tx.appointment.create({
      data: {
        slotId,
        userId,
        status: 'CONFIRMED',
      },
      include: {
        slot: {
          include: {
            doctor: { include: { clinic: true } },
          },
        },
      },
    });

    return appointment;
  });
}

async function cancelAppointment(userId, appointmentId) {
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findFirst({
      where: { id: appointmentId, userId, status: 'CONFIRMED' },
      include: { slot: true },
    });

    if (!appointment) {
      const err = new Error('Appointment not found or cannot be cancelled');
      err.statusCode = 404;
      err.expose = true;
      throw err;
    }

    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    });

    await tx.availabilitySlot.update({
      where: { id: appointment.slotId },
      data: { status: 'OPEN' },
    });

    return { id: appointmentId, status: 'CANCELLED' };
  });
}

async function listMyAppointments(userId, { page = 1, limit = 20 }) {
  const take = Math.min(Math.max(limit, 1), 50);
  const skip = (Math.max(page, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        slot: {
          include: {
            doctor: { include: { clinic: true } },
          },
        },
      },
    }),
    prisma.appointment.count({ where: { userId } }),
  ]);

  return { items, total, page: Math.max(page, 1), limit: take };
}

module.exports = { bookAppointment, cancelAppointment, listMyAppointments };
