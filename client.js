const express = require("express");
const internal_storage = {};
const mongoose = require("mongoose");
const fs = require("fs");
var path = require("path");
const readline = require("readline");
const httpJSONRequest = require("./httpJSONRequest");
const app = express();
var saveas = "";
const conn1 = (global.conn1 = mongoose.createConnection(
	"mongodb://localhost/academy"
));

const conn2 = (global.conn2 = mongoose.createConnection(
	"mongodb://localhost/academylog"
));
app.use("/client_input", express.static("client_input"));
//getting the file name from the client-Remember to wite like the following:client.js client_input/good file1.txt
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
			case "add_student": {
				//Checking if the line is valid or not
				try {
					JSON.parse(params[1]);
				} catch (err) {
					console.log(`Line ---- ${line} ---- was corrupted`);
					break;
				}
				//checking if there is saveas parameter or not
				if (params[2] != "saveas") {
					//saveas is optional!
					saveasFlag = false;
					console.log("saveasFlag is false");
				} else {
					console.log("saveasFlag is true");
					saveasFlag = true;
				}
				console.log("adding student");

				async function run() {
					console.log("run");
					let reply;
					reply = await httpJSONRequest(
						"post",
						"http://localhost:8080/student/add",
						params[1]
					);
					//returning the student id of the got just got created and also saving the object into the
					//internal_storage variable for future uses
					if (saveasFlag) {
						//Taking the replay string and make into JSON string and then
						//making it into JSON object in order to use the variables as required
						//and saving it inside the saveas name inside the internal_storage
						console.log(reply + "reply");
						let result = JSON.stringify(reply);
						result = JSON.parse(result);
						console.log(result[0]._id);
						saveas = params[3];
						internal_storage[saveas] = result[0];
						console.log(internal_storage[saveas] + "saveas");
						//for testing!
						// //const the_doc_id = internal_storage[saveas]._id;
						// console.log("the_doc_id: " + the_doc_id);
						// console.log(internal_storage);
					}

					console.log(
						"The reply of the student object that added to the data base:" +
							JSON.stringify(reply)
					);
				}

				console.log(run());
				break;
			}
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
				async function run() {
					console.log("run");
					let reply;
					reply = await httpJSONRequest(
						"post",
						"http://localhost:8080/student/deleteall"
					);
					//returning the student id ooj that got just got created
					console.log(
						"The reply of the deleting all students objects that currently in the data base:" +
							JSON.stringify(reply)
					);
				}

				console.log(run());

				break;
			}
			default:
				console.log(`Unrecognized command line (ignored):${line}`);
		}
	}
}
//check what is the file type and allowing only txt files
console.log(file);
if (path.extname(file) == ".txt") {
	processLineByLine(file);
} else if (path.extname(file) != ".txt") {
	console.log("Only text files are allowed!");
}
