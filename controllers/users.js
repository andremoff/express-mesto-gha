const User = require('../models/user');

// Обработчик для получения всех пользователей
const getUsers = (req, res) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при получении списка пользователей' });
    });
};

// Обработчик для получения пользователя по _id
const getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Пользователь не найден' });
      }
      return res.send(user);
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при получении пользователя' });
    });
};

// Обработчик для обновления профиля пользователя
const updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Пользователь не найден' });
      }
      return res.send(user);
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при обновлении профиля пользователя' });
    });
};

// Обработчик для обновления аватара пользователя
const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Пользователь не найден' });
      }
      return res.send(user);
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при обновлении аватара пользователя' });
    });
};

// Обработчик для создания пользователя
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.status(201).send(user);
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при создании пользователя' });
    });
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  createUser,
};
