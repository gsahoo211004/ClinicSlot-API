const bcrypt = require('bcryptjs');
const { prisma } = require('../src/lib/prisma');

async function resetDatabase() {
  await prisma.appointment.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.user.deleteMany();
}

async function seedMinimalCatalog() {
  const clinic = await prisma.clinic.create({
    data: { name: 'Test Clinic', city: 'Bangalore' },
  });
  const doctor = await prisma.doctor.create({
    data: {
      clinicId: clinic.id,
      name: 'Dr. Test',
      specialty: 'General',
    },
  });
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(14, 0, 0, 0);
  const end = new Date(start);
  end.setMinutes(30);

  const slot = await prisma.availabilitySlot.create({
    data: {
      doctorId: doctor.id,
      startAt: start,
      endAt: end,
      status: 'OPEN',
    },
  });

  return { clinic, doctor, slot };
}

async function createPatient(email = 'test@example.com', password = 'TestPass123!') {
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: { email, passwordHash, role: 'PATIENT' },
  });
}

module.exports = { resetDatabase, seedMinimalCatalog, createPatient };
