function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal server error';

  if (status >= 500) {
    console.error(err);
  }

  return res.status(status).json({ error: message });
}

module.exports = { errorHandler };
