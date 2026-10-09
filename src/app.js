const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'clinicslot-api' });
  });

  app.use('/auth', authRoutes);
  app.use('/', catalogRoutes);
  app.use('/appointments', appointmentRoutes);
  app.use('/admin', adminRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
