//Extending the native Error object
class AppError extends Error {
  constructor(message, statusCode){
    super(message);//The message is the string that will be displayed

    this.statusCode = statusCode;//The status (404,500, etc..)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;