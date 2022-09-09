const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const readline = require("readline");
const httpJSONRequest = require("./httpJSONRequest");
const app = express();
const bodyParser = require("body-parser");
const Student = require("./models/student_model");
const Log = require("./models/log_model");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const port = process.env.PORT || 8080;
const conn1 = mongoose.createConnection("mongodb://localhost/academy");
const conn2 = mongoose.createConnection("mongodb://localhost/academylog");
const objectid = mongoose.Types.ObjectId;
app.use("/public/client_text_files", express.static("client_text_files"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.engine("html", require("ejs").renderFile);

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/client_text_files");
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
app.get("/client/choosing_text_file", async (req, res) => {
	res.render("client_form.html");
	console.log("file was chosen");
});

app.post("/client/upload_text_file", async (req, res) => {
	console.log("uploading file");
	let upload = multer({
		storage: storage,
		fileFilter: function (req, file, cb) {
			// Accept text file Only only
			if (!file.originalname.match(/\.(txt)$/)) {
				req.fileValidationError = "Only text files are allowed!";
				return cb(new Error("Only text files are allowed!"), false);
			}
			cb(null, true);
		},
	}).single("txt_file");

	upload(req, res, async function (err) {
		//console.log(req.file.path);
		if (req.fileValidationError) {
			return res.send(req.fileValidationError);
		}
		try {
			console.log(req.file.path);
		} catch (error) {
			return res.send("No file was chosen");
		}
		//return res.send("Please select an text file to upload");
		if (err instanceof multer.MulterError) {
			return res.send(err);
		} else if (err) {
			return res.send(err);
		}
		console.log(req.file.path);
		res.setHeader("Content-type", "text/html");

		async function processLineByLine(file_name) {
			const rs = fs.createReadStream(file_name);

			const rl = readline.createInterface({
				input: rs,
				crlfDelay: Infinity,
			});
			for await (const raw_line of rl) {
				line = raw_line.trim();
				if (!line || line.startsWith("//")) {
					continue;
				}

				const params = line.split(/[ \t]+/);
				console.log(params[2]);
				switch (params[0]) {
					case "add_student":
						if (params[2] != "saveas") {//saveas is optional!
							res.send("Error: saveas is missing!");
						} else {
							console.log("adding student");
							const httpJSONRequest = require("./httpJSONRequest");
							//
							async function run() {
								let reply;
								reply = await httpJSONRequest(
									"post",
									"http://localhost:8080/client/upload_text_file",
									JSON.stringify(params[1])
								);
								console.log(reply + "reply");
							}
							run().catch((err) => console.log(err));

							// handle adding a student
							const student_data = JSON.parse(params[1]);
							const log_model = conn2.model("log_schema", Log.schema);
							const log = new log_model({
								action: "add_student",
								method: "POST",
								path: "client/upload_text_file",
								runmode: "client",
								when: new Date(),
							});
							console.log(log);
							const st_model = conn1.model("student_schema", Student.schema);
							const s = new st_model({
								// _id: params[3],
								id: student_data.id,
								toar: student_data.toar,
								city: student_data.city,
								name: student_data.name,
							});
							console.log(s);
							try {
								await s.save();
								console.log("Student saved successfully");
								await log.save();

								console.log("log saved successfully");
							} catch (err) {
								console.log(err.message);
							}
							//console.log(await st_model.find({ id: "111111888" }).exec());
							// fs.readFile(req.file.path, (e, data) => {
							// 	if (e) throw e;
							// 	res.send(
							// 		`<html><body>name of the uploaded file: ${req.file.originalname}</body></html><br>The contact of the file: ` +
							// 			data
							// 	);
							// });

							break;
						}
					case "get_students": {
						//get_students {"toar":"ma"} expected_saveas_names [‘st1’,’st2’]
						console.log("get_students");
						//getting students from the mongoDB database according to the given parameters
						const st_model = conn1.model("student_schema", Student.schema);
						const students = await st_model.find({ toar: "ba" }).exec();
						console.log(students);

						//res.send("student_data");
						break;
					}
					case "update_student": {
						break;
					}
					case "add_course": {
						break;
					}
					case "del_student": {
						break;
					}
					case "del_all": {
						break;
					}
					default:
						console.log("Unrecognized command (ignored):", line);
				}
			}
		}
		processLineByLine(req.file.path);
	});
});

app.listen(port, () => console.log(`Listening on port ${port}...`));