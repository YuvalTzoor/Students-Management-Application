const express = require("express");
const path = require("path");
const { default: mongoose } = require("mongoose");
const Student = require("../models/student_model");
const router = express.Router();



// Object that holds values for persistence(add form)
const obj = {
	id: "",
	name: "",
	city: "",
	toar: "",
};

let addStudentMsg = false;

//Delete user func
async function delete_user(req, res) {
	let id = req.params.id;
	try {
		result = await Student.deleteOne({ _id: id });
		console.log(result);
		if (result.deletedCount !== 1) {
			res.send("Could not delete student");
			return;
		}
		setTimeout(() => {
			res.redirect("http://localhost:8080/student/");
		}, "100");
	} catch {
		res.send("Could not delete student");
	}
}

//Loading an HTML DIV - containing a list of registered students with a filtering feature.
router.get("/", async (req, res) => {
	try {
		if (global.workMode == "HTML") {
			const dest = "http://localhost:8080/student/delete/";
			//debugger;
			addStudentMsg = false;
			obj.id = "";
			obj.name = "";
			obj.city = "";
			obj.toar = "";
			// const students = await User.find(req.query);
			const filter = {
				$expr: { $and: [] },
			};
			const bodyObj = {
				toar: req.query.toar,
				city: req.query.city,
				grade: req.query.grade,
			};
			if (bodyObj.city && bodyObj.city.trim() != "") {
				filter["$expr"]["$and"].push({ $eq: ["$city", bodyObj.city] });
			}
			if (bodyObj.toar && bodyObj.toar.trim() != "") {
				if (bodyObj.toar === "all") {
				} else {
					filter["$expr"]["$and"].push({ $eq: ["$toar", bodyObj.toar] });
				}
			}
			if (bodyObj.grade && bodyObj.grade.trim() != "") {
				avg_num = bodyObj.grade * 1;
				filter["$expr"]["$and"].push({
					$gte: [{ $avg: "$courses.grade" }, avg_num],
				});
			}
			const students = await Student.find(filter);
			console.log(bodyObj);

			//debugger;
			res.render("main", {
				obj1: students,
				dest: dest,
				baseUrl: req.baseUrl,
			});
		} else if (global.workMode == "JSON") {
			console.log("JSON mode for getting students");
			try {
				const filter = {
					$expr: { $and: [] },
				};
				const bodyObj = {
					toar: req.query.toar,
					city: req.query.city,
					grade: req.query.grade,
				};
				if (bodyObj.city && bodyObj.city.trim() != "") {
					filter["$expr"]["$and"].push({ $eq: ["$city", bodyObj.city] });
				}
				if (bodyObj.toar && bodyObj.toar.trim() != "") {
					if (bodyObj.toar === "all") {
					} else {
						filter["$expr"]["$and"].push({ $eq: ["$toar", bodyObj.toar] });
					}
				}
				if (bodyObj.grade && bodyObj.grade.trim() != "") {
					console.log("grade is not empty");
					avg_num = bodyObj.grade * 1;
					filter["$expr"]["$and"].push({
						$gte: [{ $avg: "$courses.grade" }, avg_num],
					});
				}
				const students = await Student.find(filter);
				console.log(students);
				//creating an array of students id's
				let students_id_to_return = [];
				for (let i = 0; i < students.length; i++) {
					students_id_to_return.push(students[i]._id);
				}
				const JSONrespond = JSON.stringify(students_id_to_return);
				res.send(JSONrespond);
				//console.log(bodyObj);
			} catch {
				console.log("Error");
				res.send("FAILED");
			}
		}
	} catch (err) {
		console.log(err);
		res.send("FAILED");
	}
});

//Loading an HTML Form for adding a new student to the DB
router.get("/add", async (req, res) => {
	try {
		res.render("add-form", {
			baseUrl: req.baseUrl,
			student: obj,
			msg: addStudentMsg,
		});
	} catch (err) {
		console.log(err);
		res.send("FAILED");
	}
});

//Executing a POST request to add a Student
router.post("/add", async (req, res) => {
	// const st_model = conn1.model("student_schema", Student.schema);
	const newStudent = new Student(req.body);
	const error = newStudent.validateSync();
	if (error) {
		console.log("The coming data did not match the schema");
		if (global.workMode == "HTML") {
			res.send("Failed to add student");
		} else {
			res.json("FAILED");
		}
		return;
	}
	try {
		const the_added_student = await newStudent.save();
		if (global.workMode == "HTML") {
			console.log("Successfully stored student");
			obj.id = "";
			obj.name = "";
			obj.city = "";
			obj.toar = "";
			obj.id = req.body.id;
			obj.name = req.body.name;
			obj.city = req.body.city;
			obj.toar = req.body.toar;
			addStudentMsg = true;
			res.redirect(req.baseUrl + "/add");
		} else if (global.workMode == "JSON") {
			// console.log("JSON mode for adding student");
			// const st_model = conn1.model("student_schema", Student.schema);
			// const newStudent = await st_model.create(await req.body);
			const stu_added_obj = await Student.find({
				_id: newStudent._id,
			}).exec();
			console.log(stu_added_obj);
			console.log(stu_added_obj[0]._id + "_identifier");
			console.log("ROW 183");
			res.send(JSON.stringify(stu_added_obj));
		}
	} catch (err) {
		console.log("Error when try to add student");
		if (global.workMode == "HTML") {
			res.sendStatus(404);
		} else {
			res.json("FAILED");
		}
	}
});

//Loading an updating page of a specific student
router.get("/update/:id", async (req, res) => {
	try {
		const dest = "http://localhost:8080/student/update/";
		const student = await Student.findById(req.params.id);
		res.render("update-form", {
			obj1: student,
			id: req.params.id,
			dest: dest,
			baseUrl: req.baseUrl,
		});
	} catch (err) {
		console.log(err);
		res.send("Could not find requested student");
	}
});

//Updating the student details via POST request
router.post("/update/:id", async (req, res) => {
	try {
		if (global.workMode == "HTML") {
			let query = req.params.id;
			const opts = { runValidators: true, new: true };
			const st = await Student.findOneAndUpdate(
				{ _id: query },
				{ $set: req.body },
				opts
			);
			// let update = await global.Student.updateOne(st);
			res.redirect(req.baseUrl + "/update/" + req.params.id);
			console.log(req.body);
		} else if (global.workMode == "JSON") {
			console.log("JSON mode for updating student");
			let query = req.params.id;
			function remove_the_colon(str) {
				return str.substring(1, str.length);
			}
			query = remove_the_colon(query);
			console.log(query);
			const opts = { runValidators: true, new: true };
			console.log("update");
			console.log(req.body);
			let id = mongoose.Types.ObjectId(query);

			console.log(id + " _id");
			const st = await Student.findOneAndUpdate(
				{ _id: id },
				{ $set: req.body },
				opts
			);
			console.log("student got update successfully");
			console.log(st);
			res.json(st);
		}
	} catch (err) {
		console.log(err);
		if (global.workMode == "HTML") {
			res.sendStatus(404);
		} else {
			res.json("FAILED");
		}
	}
});

//Adding a course to the student's object via POST request
router.post("/update/:id/addcourse", async (req, res) => {
	try {
		if (global.workMode == "HTML") {
			console.log("HTML mode for adding course to student");
			const opts = { runValidators: true, new: true };
			let query = req.params.id;
			let st = await Student.findOneAndUpdate(
				{
					_id: query,
				},
				{
					$push: {
						courses: { cid: req.body.cid, grade: req.body.grade },
					},
				},
				opts
			);
			res.redirect(req.baseUrl + "/update/" + req.params.id);
			console.log(req.body);
		} else if (global.workMode == "JSON") {
			console.log("JSON mode for adding course to student");
			const opts = { runValidators: true, new: true };
			let query = req.params.id;
			function remove_the_colon(str) {
				return str.substring(1, str.length);
			}
			query = remove_the_colon(query);
			console.log(query);
			let st = await Student.findOneAndUpdate(
				{
					_id: query,
				},
				{
					$push: {
						courses: { cid: req.body.cid, grade: req.body.grade },
					},
				},
				opts
			);
			console.log("course added to student successfully");
			res.json(st);
		}
	} catch (err) {
		console.log(err);
		console.log("Error when try to add a course");
		if (global.workMode == "HTML") {
			res.sendStatus(404);
		} else {
			res.json("FAILED");
		}
	}
});

//Executing a POST request to delete a Student
router.post("/delete/:id", async (req, res) => {
	//delete_user(req,res);
	try {
		if (global.workMode == "HTML") {
			let query = req.params.id;
			result = await Student.deleteOne({ _id: query });
			console.log("Deleting student with id: " + req.params.id);
			console.log("html mode delete_student");
			console.log(result);
			if (result.deletedCount !== 1) {
				res.send("Could not delete student");
				return;
			}
			setTimeout(() => {
				res.redirect("http://localhost:8080/student/");
			}, "100");
		} else if (global.workMode == "JSON") {
			let query = req.params.id;
			console.log("json mode delete_student");
			function remove_the_colon(str) {
				return str.substring(1, str.length);
			}
			query = remove_the_colon(query);
			result = await Student.deleteOne({ _id: query });
			if (result.deletedCount !== 0) {
				console.log("The student got deleted successfully");
				return res.json(1);
			}
		}
	} catch {
		console.log("Could not delete student");
		if (global.workMode == "HTML") {
			res.sendStatus(404);
		} else {
			res.json(0);
		}
	}
});

//Executing a POST request to delete all the Students at the DB (JSON only)
router.post("/deleteall", async (req, res) => {
	if (global.workMode == "HTML") {
		res.send("Failed to delete all students");
	} else if (global.workMode == "JSON") {
		try {
			const students = await Student.collection.drop();
			res.json("OK");
			console.log("All students deleted successfully");
		} catch (err) {
			console.log(err);
			res.json("FAILED");
		}
	}
});

//Exporting router user to app.js
module.exports = router;
