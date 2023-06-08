const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const app = express();
const PORT = 3000;

app.use(helmet());
app.use(express.json());

// Промежуточное ПО для авторизации
app.use((req, res, next) => {
  req.user = { _id: '6480a5c8122920234cf56981' };
  next();
});

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

// Обработка 404 Not Found
app.use((req, res) => {
  res.status(404).json({ message: 'Запрашиваемый ресурс не найден' });
});

// Обработчик ошибок
app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'Внутренняя ошибка сервера';
  res.status(status).json({ message });
});

// Подключение к серверу MongoDB
mongoose.connect('mongodb://localhost:27017/mestodb', { useNewUrlParser: true });

app.listen(PORT);
