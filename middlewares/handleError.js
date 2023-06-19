const handleError = (err, req, res) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';
  res.status(statusCode).json({ message });
};

module.exports = handleError;