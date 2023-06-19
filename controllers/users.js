const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Joi } = require('celebrate');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

// Функция для получения всех пользователей
const getUsers = (req, res, next) => {
  User.find({})
    .select('-password')
    .then((users) => res.json({ data: users }))
    .catch(next);
};

// Функция для получения информации о конкретном пользователе
const getUserById = (req, res, next) => {
  const { userId } = req.params;

  if (userId !== req.user._id) {
    throw new ForbiddenError('У вас нет доступа к информации о данном пользователе');
  }

  return User.findById(userId)
    .select('-password')
    .then((user) => {
      if (user === null) {
        throw new NotFoundError('Пользователь с указанным ID не найден');
      }
      return res.json({ data: user });
    })
    .catch(next);
};

// Функция для получения информации о текущем авторизованном пользователе
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .select('-password')
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.json({ data: user });
    })
    .catch(next);
};

const schemaUpdateUser = Joi.object({
  name: Joi.string().min(2).max(30).required(),
  about: Joi.string().min(2).max(30).required(),
});

const schemaUpdateAvatar = Joi.object({
  avatar: Joi.string().uri().required(),
});

// Функция для обновления информации о текущем пользователе
const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  const schema = Joi.object({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
  });

  const { error } = schema.validate({ name, about });
  if (error) {
    throw new BadRequestError('Ошибка валидации полей name и about');
  }

  return User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .select('-password')
    .orFail(() => next(new NotFoundError('Пользователь не найден')))
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

  const { error } = schemaUpdateAvatar.validate({ avatar });
  if (error) {
    throw new BadRequestError('Ошибка валидации поля avatar');
  }

  return User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .select('-password')
    .orFail(() => next(new NotFoundError('Пользователь не найден')))
    .then((user) => res.json({ data: user }))
    .catch(next);
};

// Функция для создания нового пользователя
const createUser = async (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Пользователь с таким email уже существует');
    }

    const user = await User.create({
      name: name || 'Жак-Ив Кусто',
      about: about || 'Исследователь',
      avatar: avatar || 'ссылка на картинку',
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
    if (error.name === 'ValidationError') {
      return next(new BadRequestError('Ошибка валидации пользователя'));
    }
    return next(error);
  }
};

// Функция для авторизации пользователя
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Неправильные почта или пароль' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Неправильные почта или пароль' });
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
