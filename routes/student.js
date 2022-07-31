const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/student_model");
const router = express.Router();
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

//Loading an HTML DIV - containing a list of registered students with a filtering feature.
router.get("/", async (req, res) => {});

//Loading an HTML Form for adding a new student to the DB
router.get("/add", (req, res) => {});

//Executing a POST request to delete a Student
router.post("/delete/:id", async (req, res) => {});

//Loading an updating page of a specific student
router.get("/update/:id", (req, res) => {});

//Exporting router user to app.js
module.exports = router;
