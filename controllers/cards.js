const Joi = require('joi');
const Card = require('../models/card');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');
const NotFoundError = require('../errors/NotFoundError');

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
    return next(new BadRequestError('При создании карточки переданы некорректные данные.'));
  }

  return Card.create({ name, link, owner })
    .then((card) => {
      res.json({ data: card });
    })
    .catch(next);
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
      res.json({ data: card });
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
      res.json({ data: card });
    })
    .catch(next);
};

// Удаление карточки
const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным id не найдена.');
      } else if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Недостаточно прав для выполнения операции.');
      }
      Card.deleteOne(card).then(() => {
        res.json({ data: card });
      });
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
