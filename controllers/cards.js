const Joi = require('joi');
const Card = require('../models/card');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

// Получение всех карточек
const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      if (!cards) {
        throw new NotFoundError('Карточки не найдены');
      }
      res.json({ data: cards });
    })
    .catch(next);
};

// Создание новой карточки
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  const schema = Joi.object({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().uri().required(),
    owner: Joi.string().required(),
  });

  const { error } = schema.validate({ name, link, owner });
  if (error) {
    return next(new BadRequestError('При создании карточки переданы некорректные данные.', error));
  }

  return Card.create({ name, link, owner })
    .then((card) => {
      res.status(201).json({ card: card.toObject() });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Карточка с такими данными уже существует'));
      } else {
        next(err);
      }
    });
};

// Добавление лайка карточке
const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным id не найдена.');
      }
      return card;
    })
    .then((card) => {
      res.json({ card });
    })
    .catch(next);
};

// Удаление лайка с карточки
const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным id не найдена.');
      }
      return card;
    })
    .then((card) => {
      res.json({ card });
    })
    .catch(next);
};

// Удаление карточки
const deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным id не найдена.');
      }
      res.json({ card });
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
