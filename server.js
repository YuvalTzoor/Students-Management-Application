const express = require('express');
const path = require('path');
const { default: mongoose } = require('mongoose');
const uri = 'mongodb://localhost:27017/academy';
const User = require('./models/student_model')
let app = express()

const PORT = 8080;

//Import user router
const student_router = require('./routes/student')

//Static middleware
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({ extended:false}))


//Router middleware
app.use('/student', student_router);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'views') )

//DB connection func
async function run(){
  await mongoose.connect(uri);
  app.listen(PORT,()=>console.log(`Listening to ${PORT}`))
}
run().catch(err=>console.log(err))
