const express = require('express');
const {
  listClinics,
  listDoctorsByClinic,
  listOpenSlots,
} = require('../services/catalogService');

const router = express.Router();

router.get('/clinics', async (req, res, next) => {
  try {
    const { city, page, limit } = req.query;
    const data = await listClinics({
      city,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

router.get('/clinics/:clinicId/doctors', async (req, res, next) => {
  try {
    const data = await listDoctorsByClinic(req.params.clinicId);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

router.get('/doctors/:doctorId/slots', async (req, res, next) => {
  try {
    const { from, to, page, limit } = req.query;
    const data = await listOpenSlots(req.params.doctorId, {
      from,
      to,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
