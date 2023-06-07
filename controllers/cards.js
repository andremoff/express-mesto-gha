const Card = require('../models/card');

// Обработчик для получения всех карточек
const getCards = (req, res) => {
  Card.find()
    .then((cards) => {
      res.send(cards);
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при получении списка карточек' });
    });
};

// Обработчик для создания карточки
const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при создании карточки' });
    });
};

// Обработчик для удаления карточки по идентификатору
const deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }
      return res.send(card);
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при удалении карточки' });
    });
};

// Обработчик для добавления лайка карточке
const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }
      return res.send(card);
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при добавлении лайка карточке' });
    });
};

// Обработчик для удаления лайка с карточки
const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }
      return res.send(card);
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при удалении лайка с карточки' });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
