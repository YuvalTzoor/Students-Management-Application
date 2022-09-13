const express = require('express');
const multer = require('multer')
const path = require('path')
const User = require('../models/student_model')
const router = express.Router();


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
    if (global.workMode == "HTML") {
      const dest = "http://localhost:8080/student/delete/";
      //debugger;
      
      // const students = await User.find(req.query);
      const filter = {
        $expr: { $and: [] }
      };
      const bodyObj = {
        toar: req.query.toar,
        city: req.query.city,
        grade: req.query.grade
      };
      if ( bodyObj.city &&  bodyObj.city.trim() != '') {
        filter['$expr']["$and"].push({ "$eq": ["$city", bodyObj.city] })
        }
      if ( bodyObj.toar &&  bodyObj.toar.trim() != '') {
        if(bodyObj.toar === "all"){
          
        }
        else{
          filter['$expr']["$and"].push({ "$eq": ["$toar", bodyObj.toar] })
        }
      }
      if (bodyObj.grade && bodyObj.grade.trim() != '') {
        avg_num = bodyObj.grade * 1;
        filter['$expr']["$and"].push({ "$gte": [{ "$avg": "$courses.grade" }, 
        avg_num] })
        }
      const students = await User.find(filter);
      console.log(bodyObj);
    
    //debugger;
      res.render('main',{
        obj1: students,
        dest: dest,
        baseUrl: req.baseUrl
      });
    }else if(global.workMode == "JSON"){
      console.log("JSON mode for adding student");
    }
  }catch(err){
    console.log(err);
    res.send("FAILED");
  }
});



//Loading an HTML Form for adding a new student to the DB
router.get('/add',async (req,res)=>{
  try{
    res.render('add-form',{
      baseUrl: req.baseUrl
    });
  }catch(err){
    console.log(err);
    res.send("FAILED");
  }
})

//Executing a POST request to add a Student
router.post('/add', async (req,res)=>{
  try{
    if (global.workMode == "HTML") {
      const newStudent = await User.create(req.body);
      console.log(req.body.name)
      res.redirect(req.baseUrl + "/add");
    }else if (global.workMode == "JSON"){
      console.log("JSON mode for adding student");
    }

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
      const opts = { runValidators: true, new: true};
      const st = await StudentModel.findOneAndUpdate(
        { _id:query}, 
        { $set:req.body},
        opts);
      let update = await User.updateOne(st)
      res.redirect(req.baseUrl + "/update/" + req.params.id);
      console.log(req.body);
  }catch(err){
      res.send("FAILED")  
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
