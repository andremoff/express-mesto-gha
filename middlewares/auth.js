const jwt = require('jsonwebtoken');
const UnauthenticatedError = require('../errors/UnauthenticatedError');

const { JWT_SECRET = 'your_jwt_secret' } = process.env;

const auth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Необходима авторизация');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new UnauthenticatedError('Необходима авторизация');
  }
  req.user = payload;
  return next();
};

module.exports = auth;
