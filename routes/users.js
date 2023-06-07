const express = require('express');
const {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  createUser,
} = require('../controllers/users');

const usersRouter = express.Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:userId', getUserById);
usersRouter.patch('/me', updateUser);
usersRouter.patch('/me/avatar', updateAvatar);
usersRouter.post('/', createUser);

module.exports = usersRouter;
