const Card = require('../models/card');

// Обработчик для получения всех карточек
const getCards = (req, res) => {
  Card.find()
    .then((cards) => res.json(cards))
    .catch(() => res.status(500).json({ message: 'Ошибка при получении списка карточек' }));
};

// Обработчик для создания карточки
const createCard = (req, res) => {
  const { name, link } = req.body;
  if (name.length < 2) {
    return res.status(400).json({ message: 'Длина имени карточки должна быть не менее 2 символов' });
  }
  if (name.length > 30) {
    return res.status(400).json({ message: 'Длина имени карточки должна быть не более 30 символов' });
  }

  return Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).json(card))
    .catch(() => res.status(500).json({ message: 'Ошибка при создании карточки' }));
};

// Обработчик для удаления карточки по идентификатору
const deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        return res.status(404).json({ message: 'Карточка не найдена' });
      }
      return res.json(card);
    })
    .catch(() => res.status(500).json({ message: 'Ошибка при удалении карточки' }));
};

// Обработчик для добавления лайка карточке
const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(404).json({ message: 'Карточка не найдена' });
      }
      return res.json(card);
    })
    .catch(() => res.status(500).json({ message: 'Ошибка при добавлении лайка карточке' }));
};

// Обработчик для удаления лайка с карточки
const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(404).json({ message: 'Карточка не найдена' });
      }
      return res.json(card);
    })
    .catch(() => res.status(500).json({ message: 'Ошибка при удалении лайка с карточки' }));
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
