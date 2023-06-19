class ForbiddenError extends Error {
  constructor(message) {
    super(message, 403);
  }
}

module.exports = ForbiddenError;
