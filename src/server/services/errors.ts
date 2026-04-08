export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly code = "APP_ERROR"
  ) {
    super(message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You are not allowed to perform this action.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found.") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "A conflicting record already exists.") {
    super(message, 409, "CONFLICT");
  }
}
