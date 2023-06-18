const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const session = require('express-session');
const escapeHtml = require('escape-html');
const rateLimit = require('express-rate-limit');
const { celebrate, Joi, errors } = require('celebrate');
const { login, createUser } = require('./controllers/users');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const handleError = require('./middlewares/handleError');

const app = express();
const PORT = 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(limiter);
app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));
app.use(express.json());

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
    avatar: Joi.string().uri().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
}), (req, res, next) => {
  req.body = {
    name: escapeHtml(req.body.name),
    about: escapeHtml(req.body.about),
    avatar: escapeHtml(req.body.avatar),
    email: escapeHtml(req.body.email),
    password: escapeHtml(req.body.password),
  };
  next();
}, createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
}), (req, res, next) => {
  req.body = {
    email: escapeHtml(req.body.email),
    password: escapeHtml(req.body.password),
  };
  next();
}, login);

app.use('/users', auth, usersRouter);
app.use('/cards', auth, cardsRouter);

app.use(errors());

app.use((req, res, next) => {
  const err = new Error('Запрашиваемый ресурс не найден');
  err.status = 404;
  next(err);
});

app.use(handleError);

mongoose.connect('mongodb://localhost:27017/mestodb', { useNewUrlParser: true });

app.listen(PORT);
