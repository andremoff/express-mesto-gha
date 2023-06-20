const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const UnauthenticatedError = require('../errors/UnauthenticatedError');
const ConflictError = require('../errors/ConflictError');

// Получение всех пользователей
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
};

// Получение пользователя по идентификатору
const getUserById = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new NotFoundError('Пользователь с указанным ID не найден');
    }

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

// Получение текущего пользователя
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .select('-password')
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.json({ data: user });
    })
    .catch(next);
};

// Обновление данных пользователя
const updateUser = async (req, res, next) => {
  const { name, about } = req.body;

  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    user.name = name;
    user.about = about;

    const updatedUser = await user.save();

    res.json({ data: updatedUser });
  } catch (err) {
    next(new BadRequestError('Ошибка при обновлении пользователя', err));
  }
};

// Обновление аватара пользователя
const updateAvatar = async (req, res, next) => {
  const { avatar } = req.body;

  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    user.avatar = avatar;

    const updatedUser = await user.save();

    res.json({ data: updatedUser });
  } catch (err) {
    next(new BadRequestError('Ошибка при обновлении аватара пользователя', err));
  }
};

// Создание нового пользователя
const createUser = async (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ConflictError('Пользователь с таким email уже существует');
    }

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
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
      token,
    });
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(new BadRequestError('Ошибка при создании пользователя', err));
  }
};

// Авторизация пользователя
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new UnauthenticatedError('Неправильные почта или пароль'));
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return next(new UnauthenticatedError('Неправильные почта или пароль'));
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
