const Joi = require('joi');

const loginSchema = Joi.object().keys({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
});

const cardSchema = Joi.object().keys({
  name: Joi.string().required().min(2).max(30),
  link: Joi.string().required().uri(),
});

const userSchema = Joi.object().keys({
  name: Joi.string().min(2).max(30),
  about: Joi.string().min(2).max(30),
  avatar: Joi.string().uri(),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
});

const updateUserSchema = Joi.object().keys({
  name: Joi.string().min(2).max(30),
  about: Joi.string().min(2).max(30),
});

const updateAvatarSchema = Joi.object().keys({
  avatar: Joi.string().uri(),
});

module.exports = {
  loginSchema,
  cardSchema,
  userSchema,
  updateUserSchema,
  updateAvatarSchema,
};
