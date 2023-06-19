class BadRequestError extends Error {
  constructor(message) {
    super(message, 400);
  }
}

module.exports = BadRequestError;
