const User = require('../models/user');

// Получение списка пользователей
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.json({ data: users }))
    .catch(() => res.status(500).json({ message: 'Ошибка на сервере при получении списка пользователей' }));
};

// Получение информации о пользователе по ID
const getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'Пользователь с указанным ID не найден' });
      }
      return res.json({ data: user });
    })
    .catch(() => res.status(500).json({ message: 'Ошибка на сервере при поиске пользователя' }));
};

// Обновление профиля пользователя
const updateUser = (req, res) => {
  const { name, about } = req.body;

  if (name && (name.length < 2 || name.length > 30)) {
    return res.status(400).json({ message: 'Длина имени должна быть от 2 до 30 символов' });
  }

  return User.findByIdAndUpdate(req.user._id, { name, about }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      const updatedUser = {
        _id: user._id,
        name: user.name,
        about: user.about,
      };

      return res.status(200).json(updatedUser);
    })
    .catch((err) => res.status(500).json({ message: `Ошибка при обновлении профиля пользователя: ${err}` }));
};

// Обновление аватара пользователя
const updateAvatar = (req, res) => {
  const { avatar } = req.body;

  return User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      return res.json(user);
    })
    .catch((err) => res.status(500).json({ message: `Ошибка при обновлении аватара пользователя: ${err}` }));
};

// Создание нового пользователя
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  if (name.length < 2 || name.length > 30) {
    return res.status(400).json({ message: 'Длина имени должна быть от 2 до 30 символов' });
  }

  return User.create({ name, about, avatar })
    .then((user) => res.status(201).json(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: 'Ошибка валидации' });
      }
      return res.status(500).json({ message: `Ошибка при создании пользователя: ${err}` });
    });
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  createUser,
};
