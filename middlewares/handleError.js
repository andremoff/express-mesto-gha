const handleError = (err, req, res) => {
  let statusCode = 500;
  let message = 'Внутренняя ошибка сервера';

  // Определяем статус код и сообщение для разных типов ошибок
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Ошибка валидации';
  } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Некорректный ID';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Неверный токен';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Пользователь с таким email уже существует';
  }

  res.status(statusCode).json({ message });
};

module.exports = handleError;
