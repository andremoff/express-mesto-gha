const User = require('../models/user');

// Получение всех пользователей
const getUsers = (req, res) => {
  User.find()
    .then((users) => res.send(users))
    .catch((err) => res.status(500).send({ message: `Ошибка при получении списка пользователей: ${err}` }));
};

// Получение пользователя по ID
const getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Пользователь не найден' });
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Неверный формат идентификатора пользователя' });
      }
      return res.status(500).send({ message: `Ошибка при получении пользователя: ${err}` });
    });
};

// Обновление профиля пользователя
const updateUser = (req, res) => {
  const { name, about } = req.body;
  if (name.length < 2 || name.length > 30) {
    return res.status(400).send({ message: 'Длина имени должна быть от 2 до 30 символов' });
  }
  if (about.length < 2 || about.length > 30) {
    return res.status(400).send({ message: 'Длина информации о себе должна быть от 2 до 30 символов' });
  }
  return User.findByIdAndUpdate(req.user._id, { name, about }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Пользователь не найден' });
      }
      // Создаем объект с обновленными данными пользователя
      const updatedUser = {
        _id: user._id,
        name: user.name,
        about: user.about,
      };
      return res.status(200).send(updatedUser);
    })
    .catch((err) => res.status(500).send({ message: `Ошибка при обновлении профиля пользователя: ${err}` }));
};

// Обновление аватара пользователя
const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  return User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Пользователь не найден' });
      }
      return res.send(user);
    })
    .catch((err) => res.status(500).send({ message: `Ошибка при обновлении аватара пользователя: ${err}` }));
};

// Создание нового пользователя
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  if (name.length < 2 || name.length > 30) {
    return res.status(400).send({ message: 'Длина имени должна быть от 2 до 30 символов' });
  }
  if (about.length < 2 || about.length > 30) {
    return res.status(400).send({ message: 'Длина информации о себе должна быть от 2 до 30 символов' });
  }
  return User.create({ name, about, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Ошибка валидации' });
      }
      return res.status(500).send({ message: `Ошибка при создании пользователя: ${err}` });
    });
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  createUser,
};
