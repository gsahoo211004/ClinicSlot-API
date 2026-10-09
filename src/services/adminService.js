const { z } = require('zod');
const { prisma } = require('../lib/prisma');

const createSlotSchema = z.object({
  doctorId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

async function createSlot({ doctorId, startAt, endAt }) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (end <= start) {
    const err = new Error('endAt must be after startAt');
    err.statusCode = 400;
    err.expose = true;
    throw err;
  }

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) {
    const err = new Error('Doctor not found');
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  return prisma.availabilitySlot.create({
    data: {
      doctorId,
      startAt: start,
      endAt: end,
      status: 'OPEN',
    },
  });
}

module.exports = { createSlotSchema, createSlot };
