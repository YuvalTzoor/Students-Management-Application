const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
var path = require("path");
const readline = require("readline");
const httpJSONRequest = require("./httpJSONRequest");
const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const Student = (global.Student = require("./models/student_model"));
const Log = (global.Log = require("./models/log_model"));
var urlencodedParser = bodyParser.urlencoded({ extended: false });
//const port = process.env.PORT || 8080;
const conn1 = (global.conn1 = mongoose.createConnection(
	"mongodb://localhost/academy"
));
// console.log(global.conn1);
const conn2 = (global.conn2 = mongoose.createConnection(
	"mongodb://localhost/academylog"
));
app.use("/client_input", express.static("client_input"));
//getting the file name from the client
let arguments = process.argv.slice(2);
console.log(arguments);
let fullFileName = "";
if (arguments.length == 1) {
	fullFileName = arguments[0];
} else {
	for (i = 0; i < arguments.length; i++) {
		fullFileName = fullFileName + arguments[i] + " ";
	}
	fullFileName =
		fullFileName.substring(0, fullFileName.lastIndexOf(".")) || fullFileName;
	fullFileName = fullFileName + ".txt";
	console.log(fullFileName);
}

let file = fullFileName;

console.log("uploading file");

/////////////////////////////////////////////////////////////////
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
		console.log(params);

		switch (params[0]) {
			case "add_student":
				try {
					JSON.parse(params[1]);
				} catch (err) {
					console.log(`Line ---- ${line} ---- was corrupted`);
					break;
				}

				if (params[2] != "saveas") {
					//saveas is optional!
					saveasFlag = false;
					console.log("saveasFlag is false");
				} else {
					console.log("saveasFlag is true");
					saveasFlag = true;
				}
				console.log("adding student");

				//
				async function run(stu_data) {
					let reply;
					reply = await httpJSONRequest(
						"post",
						"http://localhost:8080/student/add",
						JSON.stringify(params[1])
					);
					console.log(reply + "reply");
				}
				run(JSON.parse(params[1])).catch((err) => console.log(err));
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
				const stu = new st_model({
					id: student_data.id,
					toar: student_data.toar,
					city: student_data.city,
					name: student_data.name,
				});
				console.log(stu);
				try {
					await stu.save();
					console.log("Student saved successfully");
					await log.save();

					console.log("log saved successfully");
				} catch (err) {
					console.log(err.message);
				}

				break;

			case "get_students": {
				//get_students {"toar":"ma"} expected_saveas_names [‘st1’,’st2’]
				console.log("get_students");
				//getting students from the mongoDB database according to the given parameters
				const st_model = global.conn1.model(
					"student_schema",
					global.Student.schema
				);
				const students = await st_model.find({ toar: "ba" }).exec();
				console.log(students);
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
				console.log(`Unrecognized command line (ignored):${line}`);
		}
	}
}
//check what is the file type and allowing only txt files
console.log(path.extname(file));
if (path.extname(file) == ".txt") {
	processLineByLine(file);
} else if (path.extname(file) != ".txt") {
	console.log("Only text files are allowed!");
}
