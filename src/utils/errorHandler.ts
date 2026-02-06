class ErrorHandler extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ErrorHandler";
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;

