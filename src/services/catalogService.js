const { prisma } = require('../lib/prisma');

async function listClinics({ city, page = 1, limit = 20 }) {
  const take = Math.min(Math.max(limit, 1), 50);
  const skip = (Math.max(page, 1) - 1) * take;
  const where = city ? { city: { equals: city, mode: 'insensitive' } } : {};

  const [items, total] = await Promise.all([
    prisma.clinic.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take,
    }),
    prisma.clinic.count({ where }),
  ]);

  return { items, total, page: Math.max(page, 1), limit: take };
}

async function listDoctorsByClinic(clinicId) {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) {
    const err = new Error('Clinic not found');
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  const doctors = await prisma.doctor.findMany({
    where: { clinicId },
    orderBy: { name: 'asc' },
  });

  return { clinic, doctors };
}

async function listOpenSlots(doctorId, { from, to, page = 1, limit = 20 }) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { clinic: true },
  });
  if (!doctor) {
    const err = new Error('Doctor not found');
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  const take = Math.min(Math.max(limit, 1), 50);
  const skip = (Math.max(page, 1) - 1) * take;

  const where = {
    doctorId,
    status: 'OPEN',
    ...(from || to
      ? {
          startAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.availabilitySlot.findMany({
      where,
      orderBy: { startAt: 'asc' },
      skip,
      take,
    }),
    prisma.availabilitySlot.count({ where }),
  ]);

  return { doctor, items, total, page: Math.max(page, 1), limit: take };
}

module.exports = { listClinics, listDoctorsByClinic, listOpenSlots };
