const AppError = require("../utils/appError")

//This is a global function for handling errors
const handleCastErrorDB = err =>{
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message,400)
}

const sendErrorDev = (err, res)=>{
  res.status(err.statusCode).json({
    status: err.status,
    error:err,
    message: err.message,
    stack: err.stack
  })
}

const sendErrorProd = (err, res)=>{
  // Operational error: send a message to the client
  if (err.isOperational){
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  // Programming(internal) error: don't send data to the client
  } else {
    // 1) Log error
    console.log('ERROR LOG! :)', err);

    // 2) Send a generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    })
  }
  
}

module.exports = (err,req,res,next)=>{
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if(rpcess.env.NODE_ENV === 'development'){
    sendErrorDev(err,res)
  } else if (process.env.NODE_ENV === 'production'){
    let error = {...err};

    if (error.name === 'CastError') error = handleCastErrorDB(error)


    sendErrorProd(error,res)
  }
  
}

