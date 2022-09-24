const express = require("express");
const internal_storage = {};
const mongoose = require("mongoose");
const fs = require("fs");
var path = require("path");
const readline = require("readline");
const httpJSONRequest = require("./httpJSONRequest");
const { MaxKey } = require("bson");
const { ifStatement } = require("@babel/types");
const app = express();
let saveas = "";
let expected_saveas_names = "";
var go_to_next_command;
let result = "";
var ID_array_to_return = [];
var saveas_get_students = [];
var internal_storage_Id = [];
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
					for (i = 0; i < params.length; i++) {
						if (params[0] == "add_student") {
							continue;
						}
						JSON.parse(params[i]);
					}
				} catch (err) {
					console.log(`The parmater ${params[i]} ---- was corrupted`);
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
						//console.log(reply + "reply");
						let result_for_add = JSON.stringify(reply);
						result_for_add = JSON.parse(result_for_add);
						//the id of the added student
						console.log(result_for_add[0]._id);
						saveas = params[3];
						internal_storage[saveas] = result_for_add[0];
						//console.log(internal_storage[saveas] + "saveas");
						//for testing!
						// const the_doc_id = internal_storage[saveas]._id;
						// console.log("the_doc_id: " + the_doc_id);
						//console.log(internal_storage);
					}

					console.log(
						"The reply of the student object that added to the data base:" +
							JSON.stringify(reply)
					);
					// go_to_next_command = promise.resolve("done");
				}

				//console.log(run());
				const firstPromise = await run();
				//return firstPromise;
				// console.log(go_to_next_command);
				// go_to_next_command.then((reply) => {});
				break;
			}

			case "get_students": {
				function objectLength(obj) {
					var result = 0;
					for (var prop in obj) {
						if (obj.hasOwnProperty(prop)) {
							result++;
						}
					}
					return result;
				}
				//getting filtered student works fine now needs to handle the saveas parameter!
				//Checking if the line is valid or not
				try {
					for (i = 0; i < params.length; i++) {
						if (params[0] == "get_students" && params.length == 1) {
							break;
						}
						if (i == 2) {
							if (
								params[i] == "expected_saveas_names" ||
								params[i] == "expected_num_documents"
							) {
								continue;
							}
							JSON.parse(params[i]);
						}
					}
				} catch (err) {
					console.log(`The parmater ${params[i]} ---- was corrupted`);
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
					let reply = "";
					//let saveas_get_students = [];
					reply = await httpJSONRequest("get", url);
					//returning the student id ooj that got just got created for testing purposes
					result = JSON.stringify(reply);
					result = JSON.parse(result);
					const data = reply;
					//the array that will have the students documents ids for the response for the client
					// const ID_array_to_return = [];
					//printing the data of all returned students
					data.forEach((obj) => {
						Object.entries(obj).forEach(([key, value]) => {
							if (key == "_id") {
								ID_array_to_return.push(value);
							}
							//console.log(`key:${key}  value: ${value}`);
						});
						//console.log("-------------------");
						saveas_get_students = params[3];
						if (params.length > 2) {
							saveas_get_students = JSON.parse(saveas_get_students);
							//console.log(saveas_get_students);
						}

						//counting the number of returned students objects for comparison
					});
					var client_validity = true;
					// ID_array_to_return.forEach((id) => {
					// 	console.log(id + " id");
					// });
					//if expected_num_documents is given then compare the number of returned students with the expected number
					if (
						params[2] == "expected_num_documents" &&
						objectLength(saveas_get_students) == ID_array_to_return.length
					) {
						console.log("The number of returned students is correct");
						client_validity = false;
					} else if (
						params[2] == "expected_num_documents" &&
						objectLength(saveas_get_students) != ID_array_to_return.length
					) {
						console.log("The number of returned students is not correct");
						client_validity = false;
					}
					//var internal_storage_Id = [];
					//console.log(saveas_get_students + " saveas_get_students");
					//if expected_saveas_names is given then compare the returned students with the expected names
					if (params[2] == "expected_saveas_names") {
						saveas_get_students.forEach((saveas_name) => {
							//console.log(saveas_name + " saveas_name");
							//internal_storage[saveas_name] = ID_array_to_return[index];
							try {
								internal_storage_Id.push(internal_storage[saveas_name]._id);
							} catch (err) {
								console.log("The saveas name is not valid");
								client_validity = false;
							}
							// console.log(internal_storage[saveas_name]);
							// console.log(ID_array_to_return[index]);
							//console.log(internal_storage_Id + "internal_storage_Id");
						});
						console.log(internal_storage_Id + "internal_storage_id");
						function compareArrays(arr1, arr2) {
							if (arr1.length !== arr2.length) return (client_validity = false);
							for (var i = 0; i < arr1.length; i++) {
								if (arr1[i] !== arr2[i]) return (client_validity = false);
							}
						}
						if (compareArrays(internal_storage_Id, ID_array_to_return)) {
							console.log("The returned students are correct");
						}
					}
					//console.log(internal_storage_Id[0] + "internal_storage _id");
					//saving the id of the student in the another variable for testing purposes

					//saving the data of the students inside the internal_storage
					//according to the saveas name
					// for (i = 0; i < params.length; i++) {
					// 	if (i > 2) {
					// 		saveas = params[i];
					// 		console.log(saveas+"saveas");
					// 		internal_storage[saveas] = data[i - 3];
					// 	}
					// }
					//console.log(internal_storage);

					console.log(result.length);

					console.log(
						"The reply of the get student client endpoint is the following(The _id of all the students that matches to the filter): " +
							ID_array_to_return +
							"\n" +
							"and the validity of the client is: "
					);
					if (client_validity) {
						console.log("The replay from the server is valid" + "\n\n");
					} else if (!client_validity) {
						console.log("The replay from the server is invalid" + "\n\n");
					}
				}

				//console.log(run());
				const secondPromise = await run();
				//return secondPromise;
				break;
			}

			case "update_student": {
				try {
					for (i = 0; i < params.length; i++) {
						if (params[0] == "update_student") {
							continue;
						}
						JSON.parse(params[i]);
					}
				} catch (err) {
					console.log(`The parmater ${params[i]} ---- was corrupted`);
					console.log(`Line ---- ${line} ---- was corrupted`);
					break;
				}

				async function run() {
					let client_validity = false;
					try {
						saveas = params[1];
						saveas_get_students.forEach((saveas_name) => {
							if (saveas_name == saveas) {
								client_validity = true;
							}
						});
					} catch (err) {
						console.log("The saveas name is not valid");
					}
					// saveas_get_students.forEach((saveas_name) => {
					// 	if (saveas_name == saveas) {
					// 		client_validity = true;
					// 	}
					// });

					//console.log(saveas_name + " saveas_name");
					//internal_storage[saveas_name] = ID_array_to_return[index];
					// try {
					// 	internal_storage_Id.push(internal_storage[saveas_name]._id);
					// } catch (err) {
					// 	console.log("The saveas name is not valid");
					// 	client_validity = false;
					// }
					// console.log(internal_storage[saveas_name]);
					// console.log(ID_array_to_return[index]);
					//console.log(internal_storage_Id + "internal_storage_Id");
					if (client_validity) {
						const the_doc_id = internal_storage[saveas]._id;
						let reply;
						reply = await httpJSONRequest(
							"post",
							`http://localhost:8080/student/update/:${the_doc_id}`,
							params[2]
						);
						console.log(
							"The reply of the student object that got updated in the data base:" +
								JSON.stringify(reply)
						);
					} else if (!client_validity) {
						console.log("The saveas name is invalid");
					}
					//returning the student id of the got just got created and also saving the object into the
					//internal_storage variable for future uses

					// internal_storage[saveas] = result[0];
					// console.log(internal_storage[saveas] + "saveas");
					//for testing!
					// //const the_doc_id = internal_storage[saveas]._id;
					// console.log("the_doc_id: " + the_doc_id);
					// console.log(internal_storage);
					// console.log(
					// 	"The reply of the student object that got updated in the data base:" +
					// 		JSON.stringify(reply)
					// );
				}

				if (params.length == 3) {
					const thirdPromise = await run();
				} else if (params.length != 4) {
					console.log("The number of parameters is not valid");
				}

				break;
			}
			case "add_course": {
				try {
					for (i = 0; i < params.length; i++) {
						if (params[0] == "add_course") {
							continue;
						}
						JSON.parse(params[i]);
					}
				} catch (err) {
					console.log(`The parmater ${params[i]} ---- was corrupted`);
					console.log(`Line ---- ${line} ---- was corrupted`);
					break;
				}
				//const forthPromise = await run();
				break;
			}
			case "del_student": {
				try {
					for (i = 0; i < params.length; i++) {
						if (params[0] == "del_student") {
							continue;
						}
						JSON.parse(params[i]);
					}
				} catch (err) {
					console.log(`The parmater ${params[i]} ---- was corrupted`);
					console.log(`Line ---- ${line} ---- was corrupted`);
					break;
				}
				//const fifthPromise = await run();
				break;
			}
			case "del_all": {
				//Checking if the line is valid or not
				try {
					for (i = 0; i < params.length; i++) {
						if (params[0] == "del_all") {
							continue;
						}
						JSON.parse(params[i]);
					}
				} catch (err) {
					console.log(`The parmater ${params[i]} ---- was corrupted`);
					console.log(`Line ---- ${line} ---- was corrupted`);
					break;
				}
				// try {
				// 	JSON.parse(params[0]);
				// } catch (err) {
				// 	console.log(`Line ---- ${line} ---- was corrupted`);
				// 	break;
				// }
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

				const sixthPromise = await run();

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
