require('dotenv').config();

const request = require('supertest');
const { createApp } = require('../src/app');
const { prisma } = require('../src/lib/prisma');
const { resetDatabase, seedMinimalCatalog, createPatient } = require('./helpers');

const app = createApp();

describe('ClinicSlot API', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('register, login, book appointment', async () => {
    const { slot } = await seedMinimalCatalog();

    const register = await request(app)
      .post('/auth/register')
      .send({ email: 'booker@example.com', password: 'SecurePass123' });
    expect(register.status).toBe(201);
    const token = register.body.token;

    const book = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ slotId: slot.id });
    expect(book.status).toBe(201);
    expect(book.body.status).toBe('CONFIRMED');

    const list = await request(app)
      .get('/appointments/me')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(1);
  });

  test('double booking same slot returns 409', async () => {
    const { slot } = await seedMinimalCatalog();
    const userA = await createPatient('a@example.com');
    const userB = await createPatient('b@example.com');

    const loginA = await request(app)
      .post('/auth/login')
      .send({ email: 'a@example.com', password: 'TestPass123!' });
    const loginB = await request(app)
      .post('/auth/login')
      .send({ email: 'b@example.com', password: 'TestPass123!' });

    const first = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${loginA.body.token}`)
      .send({ slotId: slot.id });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${loginB.body.token}`)
      .send({ slotId: slot.id });
    expect(second.status).toBe(409);
  });

  test('cancel appointment frees slot', async () => {
    const { slot } = await seedMinimalCatalog();
    const register = await request(app)
      .post('/auth/register')
      .send({ email: 'cancel@example.com', password: 'SecurePass123' });
    const token = register.body.token;

    const book = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ slotId: slot.id });
    const appointmentId = book.body.id;

    const cancel = await request(app)
      .patch(`/appointments/${appointmentId}/cancel`)
      .set('Authorization', `Bearer ${token}`);
    expect(cancel.status).toBe(200);

    const slotRow = await prisma.availabilitySlot.findUnique({ where: { id: slot.id } });
    expect(slotRow.status).toBe('OPEN');
  });
});
