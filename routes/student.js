const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const User = require("../models/student_model");
global.Student = require("../models/student_model");
global.Log = require("../models/log_model");
global.conn1 = mongoose.createConnection("mongodb://localhost/academy");
global.conn2 = mongoose.createConnection("mongodb://localhost/academylog");
const router = express.Router();
//
const multerStorage = multer.diskStorage({
	destination: "companies",
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const { name, company } = req.body;
		cb(null, `${company}${ext}`);
	},
});

//Delete user func
async function delete_user(req, res) {
	let id = req.params.id;
	try {
		result = await user_model.deleteOne({ _id: id });
		res.send("User deleted");
	} catch {
		res.sendStatus(500);
	}
}
//Check if the image is a jpg ext
const multerFiler = (req, file, cb) => {
	const ext = path.extname(file.originalname);
	if (ext !== ".jpg") {
		cb(null, false);
	} else {
		cb(null, true);
	}
};

//Multer variable that will execute storage and filter
const upload = multer({
	storage: multerStorage,
	fileFilter: multerFiler,
}).single("upfile");

//Delete user func
async function delete_user(req, res) {
	let id = req.params.id;
	try {
		result = await User.deleteOne({ _id: id });
		res.send("User deleted");
	} catch {
		res.sendStatus(500);
	}
}

//Loading an HTML DIV - containing a list of registered students with a filtering feature.
router.get("/", async (req, res) => {
	if ((global.workMode = "HTML")) {
		try {
			const dest = "http://localhost:8080/student/delete/";
			const st_model = conn1.model("student_schema", Student.schema);
			const students = await st_model.find(req.query);
			res.render("main", {
				obj1: students,
				dest: dest,
				baseUrl: req.baseUrl,
			});
		} catch (err) {}
	} else if ((global.workMode = "JSON")) {
		//Loading a JSON file - containing a list of registered students with a filtering feature.
		router.get("/", async (req, res) => {
			try {
				const students = await User.find(req.query);
				res.json(students);
			} catch (err) {}
		});
	}
});

//Loading an HTML Form for adding a new student to the DB
router.get("/add", async (req, res) => {
	try {
		res.render("add-form");
	} catch (err) {}
});

//Executing a POST request to add a Student to the DB
router.post("/add", async (req, res) => {
	if (global.workMode == "HTML") {
		try {
			const st_model = conn1.model("student_schema", Student.schema);
			const newStudent = await st_model.create(req.body);
			console.log(req.body);
			res.redirect(req.baseUrl + "/add");
			const log_model = conn2.model("log_schema", Log.schema);
			const log = new log_model({
				action: "add_student",
				method: "post",
				path: "student/add",
				runmode: "JSON",
				when: new Date(),
			});
			await log.save();
			console.log("log saved successfully");
		} catch (err) {
			console.log(err);
		}
	} else if (global.workMode == "JSON") {
		try {
			console.log("JSON mode for adding student");
			const st_model = conn1.model("student_schema", Student.schema);
			const newStudent = await st_model.create(await req.body);
			console.log("Student added successfully");

			const stu_added_obj = await st_model
				.find({
					_id: newStudent._id,
				})
				.exec();
			console.log(stu_added_obj);
			res.send(stu_added_obj);
			const log_model = conn2.model("log_schema", Log.schema);
			const log = new log_model({
				action: "add_student",
				method: "post",
				path: "student/add",
				runmode: "JSON",
				when: new Date(),
			});
			await log.save();
			console.log("log saved successfully:" + log);
		} catch (err) {
			console.log(err);
			res.json("FAILED");
		}
		// try {
		// 	console.log("JSON mode for adding student");
		// 	let x = await req.body;
		// 	console.log(x);
		// 	// y = JSON.stringify(x);
		// 	// x = JSON.parse(y);
		// 	console.log(x.name);
		// } catch (err) {
		// 	console.log(err);
		// }
	}
});

//Executing a POST request to delete a Student
router.post("/delete/:id", async (req, res) => {
	delete_user(req, res);
});

//Loading an updating page of a specific student
router.get("/update/:id", async (req, res) => {
	try {
		const dest = "http://localhost:8080/student/update/";
		const student = await User.findById(req.params.id);

		res.render("update-form", {
			obj1: student,
			id: req.params.id,
			dest: dest,
			baseUrl: req.baseUrl,
		});
	} catch (err) {}
});

router.post("/update/:id", async (req, res) => {
	try {
		let query = req.params.id;
		let update = await User.updateOne({ _id: query }, req.body);
		res.redirect(req.baseUrl + "/update/" + req.params.id);
		console.log(req.body);
	} catch (err) {}
});

router.post("/update/:id/addcourse", async (req, res) => {
	try {
		let query = req.params.id;
		let update = await User.findOneAndUpdate(
			{
				_id: query,
			},
			{
				$push: {
					courses: { cid: req.body.cid, grade: req.body.grade },
				},
			}
		);
		res.redirect(req.baseUrl + "/update/" + req.params.id);
		console.log(req.body);
	} catch (err) {
		console.log(err);
	}
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// if (global.workMode == "JSON") {
// 	router.post("/add", async (req, res) => {
// 		console.log("got into add student in json mode");
// 		const student_data = JSON.parse(req.body.data);
// 		console.log(student_data);
// 		// const log_model = conn2.model("log_schema", Log.schema);
// 		// const log = new log_model({
// 		// 	action: "add_student",
// 		// 	method: "POST",
// 		// 	path: "client/upload_text_file",
// 		// 	runmode: "client",
// 		// 	when: new Date(),
// 		// });
// 		// console.log(log);
// 		// const st_model = conn1.model("student_schema", Student.schema);
// 		// const stu = new st_model({
// 		// 	id: student_data.id,
// 		// 	toar: student_data.toar,
// 		// 	city: student_data.city,
// 		// 	name: student_data.name,
// 		// });
// 		// console.log(stu);
// 		// try {
// 		// 	await stu.save();
// 		// 	console.log("Student saved successfully");
// 		// 	await log.save();
// 		// 	console.log("log saved successfully");
// 		// } catch (err) {
// 		// 	console.log(err.message);
// 		// }
// 	});
// }

//Exporting router user to app.js
module.exports = router;
