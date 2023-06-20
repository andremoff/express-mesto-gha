const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const session = require('express-session');
const escapeHtml = require('escape-html');
const rateLimit = require('express-rate-limit');
const { celebrate } = require('celebrate');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { userSchema, loginSchema } = require('./middlewares/validationSchemas');
const { login, createUser } = require('./controllers/users');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const handleError = require('./middlewares/handleError');
const NotFoundError = require('./errors/NotFoundError');

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
app.use(cookieParser());

app.post('/signup', celebrate({ body: userSchema }), (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  const sanitizedData = {
    name: escapeHtml(name),
    about: escapeHtml(about),
    avatar: escapeHtml(avatar),
    email: escapeHtml(email),
    password,
  };

  createUser(req, res, next, sanitizedData);
});

app.post('/signin', celebrate({ body: loginSchema }), (req, res, next) => {
  const { email, password } = req.body;

  const sanitizedData = {
    email: escapeHtml(email),
    password,
  };

  login(req, res, next, sanitizedData);
});

app.use(auth);

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

// Обработка ошибок celebrate/Joi
app.use(errors());

// Обработка несовпадающих маршрутов (404 ошибка)
app.use((req, res, next) => {
  const err = new NotFoundError('Запрашиваемый ресурс не найден');
  next(err);
});

// Обработчик ошибок
app.use(handleError);

mongoose.connect('mongodb://localhost:27017/mestodb', { useNewUrlParser: true })
  .then(() => {
    app.listen(PORT);
  });
