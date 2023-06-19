const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

const getUsers = (req, res, next) => {
  User.find({}).select('-password').exec()
    .then((users) => res.json({ data: users }))
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;

  if (userId !== req.user._id) {
    throw new ForbiddenError('У вас нет доступа к информации о данном пользователе');
  }

  return User.findById(userId).select('-password').exec()
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с указанным ID не найден');
      }
      return res.json({ data: user });
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id).select('-password').exec()
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.json({ data: user });
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  return User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true }).select('-password').exec()
    .then((user) => {
      const updatedUser = {
        _id: user._id,
        name: user.name,
        about: user.about,
      };
      return res.status(200).json(updatedUser);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Ошибка валидации полей name и about'));
      } else {
        next(new BadRequestError('Ошибка при обновлении пользователя'));
      }
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  return User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true }).select('-password').exec()
    .then((user) => res.json({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Ошибка валидации поля avatar'));
      } else {
        next(new BadRequestError('Ошибка при обновлении аватара пользователя'));
      }
    });
};

const createUser = async (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  try {
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
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Ошибка валидации'));
    }
    if (err.name === 'MongoError' && err.code === 11000) {
      return next(new BadRequestError('Пользователь с таким email уже существует'));
    }
    return next(new BadRequestError('Ошибка при создании пользователя'));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password').exec();
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
