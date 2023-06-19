class NotFoundError extends Error {
  constructor(message) {
    super(message, 404);
  }
}

module.exports = NotFoundError;
