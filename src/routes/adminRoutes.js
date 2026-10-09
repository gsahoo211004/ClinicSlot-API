const express = require('express');
const { authRequired, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createSlotSchema, createSlot } = require('../services/adminService');

const router = express.Router();

router.use(authRequired, requireRole('ADMIN'));

router.post('/slots', validate(createSlotSchema), async (req, res, next) => {
  try {
    const slot = await createSlot(req.validated);
    return res.status(201).json(slot);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
