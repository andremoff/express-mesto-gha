const express = require('express');
const { getUsers, getUserById, createUser } = require('../controllers/users');

const usersRouter = express.Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:userId', getUserById);
usersRouter.post('/', createUser);

module.exports = usersRouter;
