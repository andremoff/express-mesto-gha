const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const session = require('express-session');
const { escapeHtml } = require('escape-html');
const { login, createUser } = require('./controllers/users');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const handleError = require('./middlewares/handleError');
const NotFoundError = require('./errors/NotFoundError');

const app = express();
const PORT = 3000;

app.use(helmet());
app.use(express.json());
app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));

app.post('/signup', (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  const escapedBody = {
    name: escapeHtml(name),
    about: escapeHtml(about),
    avatar: escapeHtml(avatar),
    email: escapeHtml(email),
    password,
  };
  req.body = escapedBody;
  next();
}, createUser);

app.post('/signin', (req, res, next) => {
  const { email, password } = req.body;
  const escapedBody = {
    email: escapeHtml(email),
    password,
  };
  req.body = escapedBody;
  next();
}, login);

app.use('/users', auth, usersRouter);
app.use('/cards', auth, cardsRouter);

app.use((req, res, next) => {
  const err = new NotFoundError('Запрашиваемый ресурс не найден');
  next(err);
});

app.use(handleError);

mongoose.connect('mongodb://localhost:27017/mestodb', { useNewUrlParser: true })
  .then(() => {
    app.listen(PORT);
  });
