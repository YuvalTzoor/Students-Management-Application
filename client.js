const express = require("express");
const internal_storage = {};
const mongoose = require("mongoose");
const fs = require("fs");
var path = require("path");
const readline = require("readline");
const httpJSONRequest = require("./httpJSONRequest");
const { MaxKey } = require("bson");
const app = express();
var saveas = "";
// const conn1 = (global.conn1 = mongoose.createConnection(
// 	"mongodb://localhost/academy"
// ));

// const conn2 = (global.conn2 = mongoose.createConnection(
// 	"mongodb://localhost/academylog"
// ));
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
				//Checking if the line is valid or not
				try {
					JSON.parse(params[1]);
				} catch (err) {
					console.log(`Line ---- ${line} ---- was corrupted`);
					break;
				}
				console.log("get_students");
				const get_data = JSON.parse(params[1]);
				//getting students from the mongoDB database according to the given parameters
				let query = "";
				Object.keys(get_data).forEach((key) => {
					if (query) {
						query += "&" + key + "=" + get_data[key];
					} else {
						query += key + "=" + get_data[key];
					}
				});
				const url = "http://localhost:8080/student/?" + query;
				console.log(url);
				async function run() {
					console.log("run");
					let reply;
					reply = await httpJSONRequest("get", url);
					//returning the student id ooj that got just got created for testing purposes
					let result = JSON.stringify(reply);
					result = JSON.parse(result);
					const data = reply;
					//the array that will have the students documents ids for the response for the client
					const ID_array_to_return = [];
					//printing the data of all returned students
					data.forEach((obj) => {
						Object.entries(obj).forEach(([key, value]) => {
							if (key == "_id") {
								ID_array_to_return.push(value);
							}
							console.log(`${key} ${value}`);
						});
						console.log("-------------------");
					});

					console.log(result.length);

					console.log(
						"The reply of the get student client endpoint is the following(The _id of all the students that matches to the filter): " +
							ID_array_to_return
					);
				}

				console.log(run());

				break;
			}
			case "update_student": {
				try {
					JSON.parse(params[1]);
				} catch (err) {
					console.log(`Line ---- ${line} ---- was corrupted`);
					break;
				}
				async function run() {
					saveas = params[3];
					const the_doc_id = internal_storage[saveas]._id;
						console.log("run");
						let reply;
						reply = await httpJSONRequest(
							"post",
							`http://localhost:8080/student/update/:id`,
							params[1]
						);
						//returning the student id of the got just got created and also saving the object into the
						//internal_storage variable for future uses
						
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
				console.log("update_student");

				break;
			}
			case "add_course": {
				break;
			}
			case "del_student": {
				break;
			}
			case "del_all": {
				//Checking if the line is valid or not
				try {
					JSON.parse(params[0]);
				} catch (err) {
					console.log(`Line ---- ${line} ---- was corrupted`);
					break;
				}
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
