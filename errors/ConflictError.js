class ConflictError extends Error {
  constructor(message) {
    super(message, 409);
  }
}

module.exports = ConflictError;
