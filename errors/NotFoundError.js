class NotFoundError extends Error {
  constructor(message) {
    super(message, 404);
    this.statusCode = 404;
  }
}

module.exports = NotFoundError;
