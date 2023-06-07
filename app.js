const express = require('express');
const mongoose = require('mongoose');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const app = express();
const PORT = 3000;

app.use(express.json());

// Middleware for authorization
app.use((req, res, next) => {
  req.user = { _id: '6480a5c8122920234cf56981' };
  next();
});

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

// Handle 404 Not Found
app.use((req, res, next) => {
  const error = new Error('Запрашиваемый ресурс не найден');
  error.status = 404;
  next(error);
});

// Error handler middleware
app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'Внутренняя ошибка сервера';
  res.status(status).json({ message });
});

// Connect to MongoDB server
mongoose.connect('mongodb://localhost:27017/mestodb', { useNewUrlParser: true });

app.listen(PORT);
