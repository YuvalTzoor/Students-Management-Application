const e = require("express");
const express = require("express");
const internal_storage = {};
const fs = require("fs");
var path = require("path");
const readline = require("readline");
const httpJSONRequest = require("./httpJSONRequest");
const app = express();
let saveas = "";
let result = "";
let ID_array_to_return = [];
let saveas_get_students = [];
let internal_storage_Id = [];

app.use("/client_input", express.static("client_input"));
//getting the file name from the client-Remember to wite like the following:client.js client_input/good file1.txt
let arguments = process.argv.slice(2);
console.log(arguments);
//handling the file name(if the file name have spaces(works with one space only between the each word)))
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
				//Checking if the line is valid or not in the following way:
				//if the the first param is add_student it will continue to the next step
				//and if the parsing of the next params fails(meaning that the line is not valid) it will print an error message
				//with the problematic param(the first one the parsing failed on) and the line itself
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
						let result_for_add = JSON.stringify(reply);
						result_for_add = JSON.parse(result_for_add);
						//the id of the added student
						console.log(result_for_add[0]._id);
						saveas = params[3];
						internal_storage[saveas] = result_for_add[0];
					}

					console.log(
						"The reply of the student object that added to the data base:" +
							JSON.stringify(reply)
					);
				}

				const firstPromise = await run();

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

				//Checking if the line is valid or not in the following way:
				//if the the first param is get_students and the params length is one(meaning that we need to get
				//all the students from the db) it will stop and will continue to the next steps
				//if the the first param is get_students and the params length
				// is more than one(meaning that we need to get specific students from the db) it will continue to the next steps
				//now,it will check if the next param is expected_saveas_names or expected_num_documents and if
				//it is it will continue and will check the next param
				//and if the parsing of the next params fails(meaning that the line is not valid) it will print an error message
				//with the problematic param(the first one the parsing failed on) and the line itself
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
				//creating the query string
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
					reply = await httpJSONRequest("get", url);
					//returning the student id ooj that got just got created for testing purposes
					result = JSON.stringify(reply);
					result = JSON.parse(result);
					//let data = reply;
					//adding the id of all the students that got returned from the DB in order to the
					//ID_array_to_return array to check if the response is valid or not
					// data.forEach((obj) => {
					// 	Object.entries(obj).forEach(([key, value]) => {
					// 		if (key == "_id") {
					// 			ID_array_to_return.push(value);
					// 		}
					// 	});
					//console.log("-------------------");
					saveas_get_students = params[3];
					if (params.length > 2) {
						saveas_get_students = JSON.parse(saveas_get_students);
					}
					//counting the number of returned students objects for comparison

					let client_validity = true;
					if (params[2] == "expected_num_documents") {
						//if expected_num_documents is given then compare the number of returned students with the expected number
						console.log(params[2] + "-------------------" + result);
						if (
							params[2] == "expected_num_documents" &&
							params[3] == result.length
						) {
							console.log("The number of returned students is correct");
							client_validity = true;
						} else if (
							params[2] == "expected_num_documents" &&
							params[3] != result.length
						) {
							console.log("The number of returned students is not correct");
							client_validity = false;
						}
					} else if (params[2] == "expected_saveas_names") {
						console.log("saveas_get_students", saveas_get_students);
						console.log(typeof saveas_get_students);
						//if expected_saveas_names is given then compare the returned students with the expected names
						if (
							params[2] == "expected_saveas_names" &&
							typeof saveas_get_students != "number"
						) {
							console.log("go into the if");
							let i = 0;
							saveas_get_students.forEach((saveas_name) => {
								try {
									internal_storage_Id.push(internal_storage[saveas_name]._id);
									console.log("The saveas is valid");
									
									i++;
								} catch (err) {
									console.log("The saveas name is not valid");
									client_validity = false;
								}
							});
							console.log(i);
							if (i == result.length) {
								console.log("The saveas names are valid after checking");
								client_validity = true;
							} else {
								console.log("The saveas names are not valid after checking");
								client_validity = false;
							}

							console.log(internal_storage_Id + "internal_storage_id");
							// function compareArrays(arr1, arr2) {
							// 	if (arr1.length !== arr2.length)
							// 		return (client_validity = false);
							// 	for (var i = 0; i < arr1.length; i++) {
							// 		if (arr1[i] !== arr2[i]) return (client_validity = false);
							// 	}
							// }
							// if (compareArrays(internal_storage_Id, result)) {
							// 	console.log("The returned students are correct");
							// } else {
							// 	console.log("The returned students are not correct");
							// }
						}

						console.log(result.length + "result.length");
						if (result.length == 0) {
							console.log("The reply is empty");
						}
						console.log(JSON.stringify(result));

						console.log(
							"The reply of the get student client endpoint is the following(The _id of all the students that matches to the filter): " +
								JSON.stringify(result) +
								"" +
								"\n" +
								"and the validity of the client is: "
						);

						if (client_validity) {
							console.log("The replay from the server is valid" + "\n\n");
						} else if (!client_validity) {
							console.log("The replay from the server is invalid" + "\n\n");
						}
					}
				}

				const secondPromise = await run();

				break;
			}

			case "update_student": {
				//Checking if the line is valid or not in the following way:
				//if the the first param is update_student it will continue to the next step
				//and if the parsing of the next params fails(meaning that the line is not valid) it will print an error message
				//with the problematic param(the first one the parsing failed on) and the line itself
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
					//console.log(internal_storage);
					try {
						if (internal_storage[params[1]] != undefined)
							client_validity = true;
						else {
							client_validity = false;
						}
					} catch (err) {
						console.log("The saveas name is not valid");
						//creating the log of the action
					}

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
				}

				if (params.length == 3) {
					const thirdPromise = await run();
				} else if (params.length > 3) {
					console.log("The number of parameters is not valid");
				}

				break;
			}
			case "add_course": {
				//Checking if the line is valid or not in the following way:
				//if the the first param is add_course it will continue to the next step
				//and if the parsing of the next params fails(meaning that the line is not valid) it will print an error message
				//with the problematic param(the first one the parsing failed on) and the line itself
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

				async function run() {
					let client_validity = false;
					//console.log(internal_storage);
					try {
						if (internal_storage[params[1]] != undefined)
							client_validity = true;
						else {
							client_validity = false;
						}
					} catch (err) {
						console.log("The saveas name is not valid");
					}

					if (client_validity) {
						const the_doc_id = internal_storage[saveas]._id;
						let reply;
						reply = await httpJSONRequest(
							"post",
							`http://localhost:8080/student/update/:${the_doc_id}/addcourse`,
							params[2]
						);
						console.log(
							"The reply of the student object that got course added in the data base:" +
								JSON.stringify(reply)
						);
					} else if (!client_validity) {
						console.log("The saveas name is invalid");
					}
				}
				console.log(params.length);
				if (params.length == 3) {
					const forthPromise = await run();
				} else if (params.length > 3) {
					console.log("The number of parameters is not valid");
				}

				break;
			}

			case "del_student": {
				//Checking if the line is valid or not in the following way:
				//if the the first param is del_student it will continue to the next step
				//and if the parsing of the next params fails(meaning that the line is not valid) it will print an error message
				//with the problematic param(the first one the parsing failed on) and the line itself

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
				async function run() {
					let client_validity = false;

					try {
						if (internal_storage[params[1]] != undefined)
							client_validity = true;
						else {
							client_validity = false;
						}
					} catch (err) {
						console.log("The saveas name is not valid");
					}

					if (client_validity) {
						const the_doc_id = internal_storage[saveas]._id;
						console.log(the_doc_id);

						let reply;
						reply = await httpJSONRequest(
							"post",
							`http://localhost:8080/student/delete/:${the_doc_id}`
						);
						console.log(
							"The reply of the student object that got deleted in the data base:" +
								JSON.stringify(reply)
						);
						internal_storage[saveas] = null;
					} else if (!client_validity) {
						console.log("The saveas name is invalid");
					}
				}
				if (params.length == 2) {
					const fifthPromise = await run();
				} else if ((params.length = !2)) {
					console.log("The number of parameters is not valid");
				}

				break;
			}

			case "del_all": {
				//Checking if the line is valid or not in the following way:
				//if the the first param is del_all it will continue to the next step
				//and if the parsing of the next params fails(meaning that the line is not valid) it will print an error message
				//with the problematic param(the first one the parsing failed on) and the line itself

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
					//rest the internal_storage after the delete all action
					if (Object.keys(internal_storage).length > 0) {
						console.log("The");
						objectLength = Object.keys(internal_storage).length;
						console.log(
							"The number of objects in the internal storage is " + objectLength
						);

						for (var prop in internal_storage) {
							delete internal_storage[prop];
						}
					}
					objectLength = Object.keys(internal_storage).length;
					console.log(
						"The number of objects in the internal storage is " + objectLength
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
