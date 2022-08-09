const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/student_model");
const router = express.Router();
const formidable = require("formidable");
const uploadfile = multer({
	//multer settings
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			console.log(file);
			cb(null, "client_txt_files");
		},
		filename: function (req, file, cb) {
			cb(null, req.body.company + ".txt");
		},
	}),
	fileFilter: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		if (ext != ".txt") {
			cb(new multer.MulterError("Only txt files are allowed"), false);
		} else {
			cb(null, true);
		}
	},
}).single("upfile");

router.post("/upload", (req, res) => {
	console.log("uploading file");
	new formidable.IncomingForm()
		.parse(req)
		.on("fileBegin", (name, file) => {
			file.path = __dirname + "/client_txt_files/" + file.name + ".txt";
		})
		.on("file", (name, file) => {
			console.log("Uploaded file", name, file);
		})
		.on("field", (name, field) => {
			console.log("Field", name, field);
		})
		.on("file", (name, file) => {
			console.log("Uploaded file", name, file);
		})
		.on("aborted", () => {
			console.error("Request aborted by the user");
		})
		.on("error", (err) => {
			console.error("Error", err);
			throw err;
		})
		.on("end", () => {
			res.end();
		});

	//Upload txt file
	// router.post("/upload", async function (req, res) {
	// var fs = require("fs");
	// try {
	// 	uploadfile(req, res, async function (err) {
	// 		if (err instanceof multer.MulterError) {
	// 			console.log(req.file+".txt");
	// 			// some multer error occurred
	// 			if (!err.message) {
	// 				err.message = err.code;
	// 			}
	// 			res.send("file upload failed:" + err.message);
	// 		} else {
	// 			//Check if a user already uploaded a picture of the company logo of the new added user
	// 			try {
	// 				//will return true or false if the company pic logo already exists
	// 				var IsTxtExists = fs.statSync(
	// 					"client_txt_files/" + req.body.filename + ".txt"
	// 				);
	// 				var path = req.file.path;
	// 				if (path) {
	// 					path = true;
	// 				} else {
	// 					path = false;
	// 				}
	// 			} catch (e) {}

	// 			if (path) {
	// 				if (IsTxtExists) {
	// 					path = "companies/" + req.body.company + ".jpg";
	// 				} else {
	// 					path = req.file.path;
	// 				}

	// 				const u = new user_model({
	// 					name: req.body.name,
	// 					company: req.body.company,
	// 					_id: req.body._id,
	// 					upfile: path,
	// 				});

	// 				await u.save();
	// 				res.send("User saved OK");
	// 				//if a picture was not uploaded it will check if a picture of the company logo already exists or not
	// 				//if there isn't,it will put undefined in the upfile field
	// 			} else if (!path) {
	// 				if (IsPhotoExists) {
	// 					path = "companies/" + req.body.company + ".jpg";
	// 				} else {
	// 					path = undefined;
	// 				}

	// 				const u = new user_model({
	// 					name: req.body.name,
	// 					company: req.body.company,
	// 					_id: req.body._id,
	// 					upfile: path,
	// 				});

	// 				await u.save();
	// 				if (!IsPhotoExists) {
	// 					res.send("User saved But no file uploaded");
	// 				} else {
	// 					res.send("User saved OK");
	// 				}
	// 			}
	// 		}
	// 	});
	// } catch {
	// 	res.sendStatus(500); // some server internal error
	// }
});

//Loading an HTML DIV - containing a list of registered students with a filtering feature.
router.get("/", async (req, res) => {
	try {
		const users = await User.find();
		res.render("students", { users });
	} catch {
		res.sendStatus(500);
	}
});

//Loading an HTML Form for adding a new student to the DB
router.get("/add", (req, res) => {
	res.render("add_student");
});

//Executing a POST request to delete a Student
router.post("/delete/:id", async (req, res) => {});

//Loading an updating page of a specific student
router.get("/update/:id", (req, res) => {});

//Exporting router user to app.js
module.exports = router;
