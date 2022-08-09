const helpers = require("./helpers");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const readline = require("readline");
const httpJSONRequest = require("./httpJSONRequest");
const app = express();

const port = process.env.PORT || 8080;
//app.use(express.static(__dirname + "/public"));
app.use("/public", express.static("public"));

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/");
	},

	// By default, multer removes file extensions so let's add them back
	filename: function (req, file, cb) {
		cb(
			null,
			file.originalname + "-" + Date.now() + path.extname(file.originalname)
		);
		pathname =
			"public/" +
			file.originalname +
			"-" +
			Date.now() +
			path.extname(file.originalname);
	},
});

app.post("/upload-profile-pic", (req, res) => {
	console.log("uploading file");

	// res.setHeader("Content-Type", "image/PNG");
	// 'profile_pic' is the name of our file input field in the HTML form
	let upload = multer({
		storage: storage,
		fileFilter: helpers.imageFilter,
	}).single("profile_pic");

	upload(req, res, function (err) {
		console.log(req.file.path);
		// req.file contains information of uploaded file
		// req.body contains information of text fields, if there were any
		if (req.fileValidationError) {
			return res.send(req.fileValidationError);
		} else if (!req.file) {
			return res.send("Please select an text file to upload");
		} else if (err instanceof multer.MulterError) {
			return res.send(err);
		} else if (err) {
			return res.send(err);
		}

		// Display uploaded image for user validation
		res.send(
			`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`
		);
		async function processLineByLine(file_name) {
			const rs = fs.createReadStream(file_name);
			// Note: we use the crlfDelay option to recognize all instances of CR LF
			// ('\r\n') in input.txt as a single line break.
			const rl = readline.createInterface({
				input: rs,
				crlfDelay: Infinity,
			});
			for await (const raw_line of rl) {
				line = raw_line.trim();
				if (!line || line.startsWith("//")) {
					continue;
				}
				// Ok, we have a non-empty non-comment line, let's see what command it is.
				// We split the line into an array of string tokens (parts of the line).
				const params = line.split(/[ \t]+/);
				// The first token must be the command name
				switch (params[0]) {
					case "add_student":
						console.log("adding student");
						// handle adding a student
						const student_data = JSON.parse(params[1]);
						console.log(student_data.name);
						const res = await httpJSONRequest("post", "/student", student_data);
						console.log(student_data.name + " added");
						break;
					case "get_students":
						// handle getting students

						// handle retrieving students

						break;

					default:
						console.log("Unrecognized command (ignored):", line);
				}
			}
		}
		processLineByLine(req.file.path);
	});

	//processLineByLine(req.file);
});
app.listen(port, () => console.log(`Listening on port ${port}...`));
