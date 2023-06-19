class UnauthenticatedError extends Error {
  constructor(message) {
    super(message, 401);
  }
}

module.exports = UnauthenticatedError;
