const express = require('express');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  registerPatient,
  login,
} = require('../services/authService');

const router = express.Router();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await registerPatient(req.validated);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await login(req.validated);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
