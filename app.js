const express = require('express');
const { default: mongoose } = require('mongoose');
const uri = 'mongodb://localhost:27017/academy';

let app = express()

const PORT = 8080;

//Import user router
const student_router = require('./routes/student')

//Static middleware
// app.use('/student', express.static('companies'))
app.use(express.urlencoded({ extended:false}))

// //Error middleware
// app.use ((err,req,res,next)=>{
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     status: error.status,
//     message: err.message
//   })
// })

//Router middleware
app.use('/student', student_router)

//DB connection func
async function run(){
  await mongoose.connect(uri);
  app.listen(PORT,()=>console.log(`Listening to ${PORT}`))
}
run().catch(err=>console.log(err))

let var2 = 0;

let var3 = 0;