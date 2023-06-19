class ConflictError extends Error {
  constructor(message) {
    super(message, 409);
    this.statusCode = 409;
  }
}

module.exports = ConflictError;
