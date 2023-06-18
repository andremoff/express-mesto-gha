const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequest = require('../middlewares/handleError');
const NotFound = require('../middlewares/handleError');
const Unauthorized = require('../middlewares/handleError');
const InternalServerError = require('../middlewares/handleError');

// Функция для получения всех пользователей
const getUsers = (req, res, next) => {
  User.find({})
    .select('-password')
    .then((users) => res.json({ data: users }))
    .catch(() => next(new InternalServerError('Ошибка на сервере при получении списка пользователей')));
};

// Функция для получения информации о конкретном пользователе
const getUserById = (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequest('Некорректный ID пользователя');
  }

  return User.findById(userId)
    .select('-password')
    .orFail(new NotFound('Пользователь с указанным ID не найден'))
    .then((user) => res.json({ data: user }))
    .catch(next);
};

// Функция для получения информации о текущем авторизованном пользователе
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .select('-password')
    .then((user) => {
      if (!user) {
        throw new NotFound('Пользователь не найден');
      }
      return res.json({ data: user });
    })
    .catch(() => next(new InternalServerError('Ошибка на сервере при получении информации о текущем пользователе')));
};

// Функция для обновления информации о текущем пользователе
const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  return User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .select('-password')
    .orFail(new NotFound('Пользователь не найден'))
    .then((user) => {
      const updatedUser = {
        _id: user._id,
        name: user.name,
        about: user.about,
      };
      return res.status(200).json(updatedUser);
    })
    .catch(next);
};

// Функция для обновления аватара текущего пользователя
const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  return User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .select('-password')
    .orFail(new NotFound('Пользователь не найден'))
    .then((user) => res.json({ data: user }))
    .catch(next);
};

// Функция для создания нового пользователя
const createUser = async (req, res, next) => {
  const {
    name = 'Жак-Ив Кусто',
    about = 'Исследователь',
    avatar = 'ссылка на картинку',
    email,
    password,
  } = req.body;

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  try {
    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    });

    const token = jwt.sign({ _id: user._id }, 'your_jwt_secret', { expiresIn: '7d' });

    return res.status(201).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      token,
    });
  } catch (error) {
    return next(error);
  }
};

// Функция для авторизации пользователя
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Unauthorized('Неправильные почта или пароль');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new Unauthorized('Неправильные почта или пароль');
    }

    const token = jwt.sign({ _id: user._id }, 'your_jwt_secret', { expiresIn: '7d' });

    return res
      .cookie('jwt', token, {
        httpOnly: true,
        sameSite: 'Strict',
        maxAge: 3600000 * 24 * 7,
      })
      .json({ message: 'Авторизация успешна', token });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  updateAvatar,
  createUser,
  login,
};
