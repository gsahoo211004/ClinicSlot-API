const express = require('express');
const { z } = require('zod');
const { authRequired } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  bookAppointment,
  cancelAppointment,
  listMyAppointments,
} = require('../services/appointmentService');

const router = express.Router();

const bookSchema = z.object({
  slotId: z.string().uuid(),
});

router.use(authRequired);

router.get('/me', async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await listMyAppointments(req.user.id, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

router.post('/', validate(bookSchema), async (req, res, next) => {
  try {
    const appointment = await bookAppointment(req.user.id, req.validated.slotId);
    return res.status(201).json(appointment);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:appointmentId/cancel', async (req, res, next) => {
  try {
    const result = await cancelAppointment(req.user.id, req.params.appointmentId);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
