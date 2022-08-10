const express = require('express');
const multer = require('multer')
const path = require('path')
const User = require('../models/student_model')
const router = express.Router();
const multerStorage = multer.diskStorage({
  destination:'companies',
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const {name,company} = req.body
  cb(null, `${company}${ext}`);
  }
})
//Delete user func
async function delete_user (req,res) {
  let id = req.params.id;
  try {
      result = await user_model.deleteOne({ _id: id })
      res.send("User deleted");
  }
  catch {
      res.sendStatus(500)
  }
}
//Check if the image is a jpg ext
const multerFiler = (req,file,cb) =>{
  const ext = path.extname(file.originalname);
  if (ext !== '.jpg' ) {
  cb(null, false)
  }
  else {
  cb(null, true)
  }
}

//Multer variable that will execute storage and filter
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFiler
}).single('upfile')


//Delete user func
async function delete_user (req,res) {
  let id = req.params.id;
  try {
      result = await User.deleteOne({ _id: id })
      res.send("User deleted");
  }
  catch {
      res.sendStatus(500)
  }
}

//Loading an HTML DIV - containing a list of registered students with a filtering feature.
router.get('/',async (req,res)=>{
  try{
    const dest = "http://localhost:8080/student/delete/";
    console.log(req.query);
    const students = await User.find(req.query);
    res.render('main',{
      obj1: students,
      dest: dest,
      baseUrl: req.baseUrl
    });
  }catch(err){

  }
});

//Loading an HTML Form for adding a new student to the DB
router.get('/add', (req,res)=>{
  res.render('add-form');
})

//Executing a POST request to add a Student
router.post('/add', async (req,res)=>{
  try{
    const newStudent = await User.create(req.body);
    console.log(req.body)
    res.redirect(req.baseUrl + "/add");
  }catch(err){
    console.log(err);
  }
})

//Executing a POST request to delete a Student
router.post('/delete/:id',async (req,res)=>{
	delete_user(req,res);
})

//Loading an updating page of a specific student
router.get('/update/:id',async (req,res)=> {
  try{
    const dest = "http://localhost:8080/student/update/";
    const student = await User.findById(req.params.id)

    res.render('update-form',{
      obj1: student,
      id: req.params.id,
      dest: dest,
      baseUrl: req.baseUrl
    });
  }catch(err){

  }
})

router.post('/update/:id',async (req,res)=> {
  try{
    let query = req.params.id;
    let update = await User.updateOne({_id:query},req.body)
    res.redirect(req.baseUrl + "/update/" + req.params.id);
    console.log(req.body);
  }catch(err){

  }
})

router.post('/update/:id/addcourse',async (req,res)=> {
  try{
    let query = req.params.id;
    let update = await User.findOneAndUpdate({
      _id:query
    },{
      $push: {
        courses:{cid:req.body.cid,grade:req.body.grade}
        }
      })
    res.redirect(req.baseUrl + "/update/" + req.params.id);
    console.log(req.body);
  }catch(err){
    console.log(err);
  }
})


//Exporting router user to app.js
module.exports = router;