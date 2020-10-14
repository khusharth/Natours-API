// For all the Operational Errors
class AppError extends Error {
  constructor(message, statusCode) {
    // Error class only accepts message
    super(message); // To call the parent constructor

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // depnds on statusCode
    this.isOperational = true;
    // later we can test for this prop and only send message to client for these operational erros that we created using this class
    // Useful as we might have some programming error or bug in 3rd party which will create some Errors whic will then don't have this prop

    Error.captureStackTrace(this, this.constructor);
    // When the obj will be created the constructor function call will not be added to the stack trace
  }
}

module.exports = AppError;
