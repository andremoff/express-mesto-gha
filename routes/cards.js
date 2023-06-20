const express = require('express');
const { celebrate } = require('celebrate');

const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const {
  cardIdSchema,
  cardInfoSchema,
} = require('../middlewares/validationSchemas');

const cardsRouter = express.Router();

cardsRouter.get('/', getCards);
cardsRouter.post('/', celebrate({ body: cardInfoSchema }), createCard);
cardsRouter.delete('/:cardId', celebrate({ params: cardIdSchema }), deleteCard);
cardsRouter.put('/:cardId/likes', celebrate({ params: cardIdSchema }), likeCard);
cardsRouter.delete('/:cardId/likes', celebrate({ params: cardIdSchema }), dislikeCard);

module.exports = cardsRouter;
