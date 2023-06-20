const Joi = require('joi');
const Card = require('../models/card');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const ForbiddenError = require('../errors/ForbiddenError');

// Получение всех карточек
const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      if (!cards || cards.length === 0) {
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
    link: Joi.string().uri({ scheme: [/https?/] }).required(),
  });

  const { error } = schema.validate({ name, link });
  if (error) {
    return next(new BadRequestError(error.details[0].message));
  }

  return Card.create({ name, link, owner })
    .then((card) => {
      res.status(201).json({ data: card });
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
  const { cardId } = req.params;

  const schema = Joi.object({
    cardId: Joi.string().objectId().required(),
  });

  const { error } = schema.validate({ cardId });
  if (error) {
    return next(new BadRequestError('Некорректный ID карточки.', error));
  }

  return Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным id не найдена.');
      }
      return res.json({ card });
    })
    .catch(next);
};

// Удаление лайка с карточки
const dislikeCard = (req, res, next) => {
  const { cardId } = req.params;

  const schema = Joi.object({
    cardId: Joi.string().objectId().required(),
  });

  const { error } = schema.validate({ cardId });
  if (error) {
    return next(new BadRequestError('Некорректный ID карточки.', error));
  }

  return Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным id не найдена.');
      }
      return res.json({ card });
    })
    .catch(next);
};

// Удаление карточки
const deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  const schema = Joi.object({
    cardId: Joi.string().hex().length(24).required(),
  });

  const { error } = schema.validate({ cardId });
  if (error) {
    return next(new BadRequestError('Некорректный ID карточки.', error));
  }

  return Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным id не найдена.');
      }
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Вы не можете удалять чужие карточки.');
      }
      return Card.deleteOne(card);
    })
    .then(() => res.send({ message: 'Карточка успешно удалена' }))
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
