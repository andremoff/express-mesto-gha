const handleError = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';
  res.status(statusCode).json({ message });
  next();
};

module.exports = handleError;
