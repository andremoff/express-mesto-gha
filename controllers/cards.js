const { URL } = require('url');
const mongoose = require('mongoose');
const { ValidationError } = require('mongoose').Error;
const Card = require('../models/card');
const BadRequest = require('../middlewares/handleError');
const NotFound = require('../middlewares/handleError');
const Forbidden = require('../middlewares/handleError');
const InternalServerError = require('../middlewares/handleError');

// Получения всех карточек
const getCards = (req, res, next) => {
  Card.find()
    .then((cards) => res.json(cards))
    .catch(() => next(new InternalServerError('Ошибка при получении списка карточек')));
};

// Создания новой карточки
const createCard = (req, res, next) => {
  const { name, link } = req.body;

  if (!name || !link) {
    return next(new BadRequest('Поля name и link обязательны для заполнения'));
  }

  if (name.length < 2 || name.length > 30) {
    return next(new BadRequest('Длина имени карточки должна быть от 2 до 30 символов'));
  }

  let isValidURL;
  try {
    const urlObj = new URL(link);
    isValidURL = urlObj.protocol && urlObj.host;
  } catch (error) {
    isValidURL = false;
  }

  if (!isValidURL) {
    return next(new BadRequest('Поле link должно быть валидным URL'));
  }

  return Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      const { _id } = card;
      return res.status(201).json({
        _id, name, link, owner: req.user._id,
      });
    })
    .catch((error) => {
      if (error instanceof ValidationError) {
        return next(new BadRequest('Ошибка валидации карточки'));
      }
      return next(new InternalServerError('Ошибка при создании карточки'));
    });
};

// Добавления лайка карточке
const likeCard = (req, res, next) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new BadRequest('Невалидный id карточки');
  }

  return Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточка не найдена');
      }
      const {
        _id, name, link, owner, likes,
      } = card;
      return res.status(200).json({
        _id, name, link, owner, likes,
      });
    })
    .catch(() => next(new InternalServerError('Ошибка при добавлении лайка карточке')));
};

// Удаления лайка с карточки
const dislikeCard = (req, res, next) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new BadRequest('Невалидный id карточки');
  }

  return Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточка не найдена');
      }
      const {
        _id, name, link, owner, likes,
      } = card;
      return res.status(200).json({
        _id, name, link, owner, likes,
      });
    })
    .catch(() => next(new InternalServerError('Ошибка при удалении лайка с карточки')));
};

// Функция для удаления карточки
const deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new BadRequest('Невалидный id карточки');
  }

  return Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFound('Карточка не найдена');
      }

      if (card.owner.toString() !== req.user._id) {
        throw new Forbidden('У вас нет прав на удаление этой карточки');
      }

      return Card.findByIdAndRemove(cardId)
        .then((deletedCard) => {
          res.status(200).json({ message: 'Карточка успешно удалена', data: deletedCard });
        })
        .catch(() => next(new InternalServerError('Ошибка при удалении карточки')));
    })
    .catch(() => next(new InternalServerError('Ошибка при поиске карточки')));
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
