const Joi = require('joi');

const urlRegex = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

const loginSchema = Joi.object().keys({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
});

const cardSchema = Joi.object().keys({
  name: Joi.string().required().min(2).max(30),
  link: Joi.string().required().pattern(urlRegex),
});

const cardIdSchema = Joi.object().keys({
  cardId: Joi.string().length(24).hex().required(),
});

const cardInfoSchema = Joi.object().keys({
  name: Joi.string().required().min(2).max(30),
  link: Joi.string().required().pattern(urlRegex),
});

const userSchema = Joi.object().keys({
  name: Joi.string().min(2).max(30),
  about: Joi.string().min(2).max(30),
  avatar: Joi.string().pattern(urlRegex),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
});

const updateUserSchema = Joi.object().keys({
  name: Joi.string().min(2).max(30),
  about: Joi.string().min(2).max(30),
});

const updateAvatarSchema = Joi.object().keys({
  avatar: Joi.string().required().pattern(urlRegex),
});

const userIdSchema = Joi.object().keys({
  userId: Joi.string().length(24).hex().required(),
});

module.exports = {
  loginSchema,
  cardSchema,
  cardIdSchema,
  cardInfoSchema,
  userSchema,
  updateUserSchema,
  updateAvatarSchema,
  userIdSchema,
};
