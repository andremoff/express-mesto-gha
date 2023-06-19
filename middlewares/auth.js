const jwt = require('jsonwebtoken');
const UnauthenticatedError = require('../errors/UnauthenticatedError');

module.exports = (req, res, next) => {
  const { jwt: token } = req.cookies;

  if (!token) {
    throw new UnauthenticatedError('Необходима авторизация');
  }

  let payload;

  try {
    payload = jwt.verify(token, 'your_jwt_secret');
  } catch (err) {
    throw new UnauthenticatedError('Необходима авторизация');
  }

  req.user = payload;

  next();
};
