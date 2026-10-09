require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@clinicslot.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPass123!';
  const patientEmail = process.env.SEED_PATIENT_EMAIL || 'patient@example.com';
  const patientPassword = process.env.SEED_PATIENT_PASSWORD || 'PatientPass123!';

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const patientHash = await bcrypt.hash(patientPassword, 12);

  await prisma.appointment.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { email: adminEmail, passwordHash: adminHash, role: 'ADMIN' },
      { email: patientEmail, passwordHash: patientHash, role: 'PATIENT' },
    ],
  });

  const clinicA = await prisma.clinic.create({
    data: { name: 'AyurWell Primary Care', city: 'Bangalore' },
  });
  const clinicB = await prisma.clinic.create({
    data: { name: 'Chennai Family Clinic', city: 'Chennai' },
  });

  const doctors = await prisma.doctor.createMany({
    data: [
      {
        clinicId: clinicA.id,
        name: 'Dr. Ananya Rao',
        specialty: 'General Physician',
      },
      {
        clinicId: clinicA.id,
        name: 'Dr. Karthik Menon',
        specialty: 'Ayurveda Consultant',
      },
      {
        clinicId: clinicB.id,
        name: 'Dr. Priya Nair',
        specialty: 'Pediatrics',
      },
    ],
  });

  const doctorList = await prisma.doctor.findMany();
  const now = new Date();
  const slots = [];

  for (const doctor of doctorList) {
    for (let day = 1; day <= 5; day += 1) {
      const start = new Date(now);
      start.setDate(now.getDate() + day);
      start.setHours(10, 0, 0, 0);
      const end = new Date(start);
      end.setHours(10, 30, 0, 0);
      slots.push({
        doctorId: doctor.id,
        startAt: start,
        endAt: end,
        status: 'OPEN',
      });
    }
  }

  await prisma.availabilitySlot.createMany({ data: slots });

  console.log('Seed complete.');
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  console.log(`Demo patient: ${patientEmail} / ${patientPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
