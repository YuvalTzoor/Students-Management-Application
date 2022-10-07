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
//handling the file name
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
				let saveasFlag = "";
				let i = 1;
				let test_parse = "";
				let payload_flag = true;
				//checking if there is saveas parameter or not
				if (params[2] != "saveas") {
					//saveas is optional!
					saveasFlag = false;
					console.log("saveasFlag is false");
				} else {
					console.log("saveasFlag is true");
					saveasFlag = true;
				}

				//checking if the payload is valid
				try {
					console.log(i);
					
					test_parse = JSON.parse(params[1]);
					console.log(test_parse);
				} catch (err) {
					console.log(`Line ---- ${line} ---- was corrupted`);
					payload_flag = false;
					break;
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

				//checking if the payload is valid and the parameters is have the right number for every senrio
				//meaning if there is a need for the program to be saved in the internal_storage of the client app
				if (params.length == 2 && payload_flag) {
					const firstPromise = await run();
				} else if (params.length == 4 && payload_flag && saveasFlag) {
					const firstPromise = await run();
				} else {
					console.log("the required parameters are not in the right format");
				}

				break;
			}

			case "get_students": {
				//these two flags will be used later on to see if the request is valid or not
				let start_flag = true;
				let middle_flag = true;
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
				//if the params length is one(meaning that we need to get
				//all the students from the db) it will stop and will continue to the next steps
				//if  the params length is more than one(meaning that we need to get specific students from the db) it will continue to the next steps
				//now,it will check if the next param is expected_saveas_names or expected_num_documents and if
				//it is it will continue and will check the next param
				//and if the parsing of the next params fails(meaning that the line is not valid) it will print an error message
				//with the problematic param(the first one the parsing failed on) and the line itself

				try {
					for (i = 1; i < params.length; i++) {
						if (params.length == 1) {
							break;
						} else if (i == 2) {
							if (
								params[2] == "expected_saveas_names" ||
								params[2] == "expected_num_documents"
							) {
								continue;
							}
						}
						JSON.parse(params[i]);
					}
				} catch (err) {
					console.log(`Line ---- ${line} ---- was corrupted`);
					start_flag = false;
					break;
				}
				//see if the request is in the valid length or have valid params and if so it will start the running process
				if (params.length <= 4 && start_flag) {
					try {
						for (i = 1; i < params.length; i++) {
							if (params.length == 1) {
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
						console.log(`Line ---- ${line} ---- was corrupted`);
						break;
					}
					let get_data = "";
					let query = "";
					let url = "";
					console.log("get_students");
					//if the params length is one it means that we need to get all the students from the db
					//and if it is more than one it means that we need to get specific students from the db according to the params
					//that will pass to the filter
					if (params.length > 1) {
						get_data = JSON.parse(params[1]);
					} else {
						get_data = params[0];
						query = get_data;
					}

					//creating the query string according to the number of the params
					if (query != get_data) {
						Object.keys(get_data).forEach((key) => {
							console.log(key);
							console.log(get_data[key]);
							let temp_get_data = get_data[key];
							if (key == "avg") {
								key = "grade";
								get_data[key] = temp_get_data;
							}
							console.log(get_data[key]);
							//Generating the query string and if the the key avg is found it will change it to grade and also will also handel the
							//value of that key
							//(we done it for convenience purposes)
							if (query) {
								query += "&" + key + "=" + get_data[key];
							} else {
								if (key == "avg") {
									key = "grade";
									get_data[key] = temp_get_data;
								}
								console.log(get_data[key]);
							
								query += key + "=" + get_data[key];
							}
						});
						//making the url with the query string
						url = "http://localhost:8080/student/?" + query;
					} else {
						url = "http://localhost:8080/student/?" + query;
						console.log(url);
					}
					async function run() {
						let reply = "";
						reply = await httpJSONRequest("get", url);
						result = JSON.stringify(reply);
						result = JSON.parse(result);

						//checking if the saveas param is valid
						console.log(params[3]);
						if (params[3] != undefined) {
							saveas_get_students = params[3];
							try {
								saveas_get_students = JSON.parse(saveas_get_students);
							} catch (err) {
								middle_flag = false;
							}
						} else {
							middle_flag = true;
						}

						console.log("pass the try");

						let client_validity = true;
						if (middle_flag) {
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
								//if expected_saveas_names is given then a count will be made for each student and will be compared with the
								//number of saveas number that in the query
								if (
									params[2] == "expected_saveas_names" &&
									typeof saveas_get_students != "number"
								) {
									let saveas_match_counter = 0;
									saveas_get_students.forEach((saveas_name) => {
										try {
											internal_storage_Id.push(
												internal_storage[saveas_name]._id
											);
											console.log("The saveas is valid");
											saveas_match_counter++;
										} catch (err) {
											console.log("The saveas name is not valid");
											client_validity = false;
										}
									});
									console.log(saveas_match_counter);
									console.log(result);
									console.log(internal_storage_Id);
									console.log(result.length);
									//will check if the number of saveas names in the query is equal to the number at the saveas_match_counter
									//or the internal_storage_Id array and the result array are equal and if so,it will return true at the client_validity
									//variable
									if (
										saveas_match_counter == result.length ||
										JSON.stringify(internal_storage_Id) ==
											JSON.stringify(result)
									) {
										console.log("The saveas names are valid after checking");
										client_validity = true;
									} else {
										console.log(
											"The saveas names are not valid after checking"
										);
										client_validity = false;
									}

									console.log(internal_storage_Id + "internal_storage_id");
								}

								console.log(result.length + "result.length");
								//if the result array is empty the user will get a message about it
								if (result.length == 0) {
									console.log("The reply is empty");
								}
							
								//In this part we will give the reply and also will tell the user if the reply is valid or not
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
						} else if (result.length == 0) {
							console.log("The reply is empty");
						}

				
						console.log(middle_flag);
						//if there was not any expected_num_documents or expected_saveas_names in the query then the client will just get the reply
						if (middle_flag) {
							console.log(
								"The reply of the get student client endpoint is the following(The _id of all the students that matches to the filter): " +
									JSON.stringify(result)
							);
						} else if (!middle_flag) {
							console.log("one of the parameters was invalid");
						}
					}
					const secondPromise = await run();
				}
				//If there are more then 4 parameters the user will get a notification that the query is not valid
				else {
					console.log("The number of parameters is not valid");
				}
				break;
			}

			case "update_student": {
				//Checking if the line is valid or not in the following way(after making sure that we the
				//number of parameters is valid)):
				//if the parsing of the payload params fails(meaning that the line is not valid) it will print an error message with the line itself
				//and will not send the query to the server
				if (params.length == 3) {
					try {
						JSON.parse(params[2]);
					} catch (err) {
						console.log(`Line ---- ${line} ---- was corrupted`);
						break;
					}
				}

				async function run() {
					//checking if the save as parameter is valid and can be found in the internal_storage
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
				//will also check if the number of parameters is valid
				if (params.length == 3) {
					const thirdPromise = await run();
				} else if (params.length != 3) {
					console.log("The number of parameters is not valid");
				}

				break;
			}
			case "add_course": {
				//Checking if the line is valid or not in the following way(after making sure that we the
				//number of parameters is valid)):
				//if the parsing of the payload params fails(meaning that the line is not valid) it will print an error message with the line itself
				//and will not send the query to the server
				if (params.length == 3) {
					try {
						JSON.parse(params[2]);
					} catch (err) {
						console.log(`The parmater ${params[i]} ---- was corrupted`);
						console.log(`Line ---- ${line} ---- was corrupted`);
						break;
					}
				}
				async function run() {
					//checking if the save as parameter is valid and can be found in the internal_storage
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
				//will also check if the number of parameters is valid
				if (params.length == 3) {
					const forthPromise = await run();
				} else if (params.length != 3) {
					console.log("The request wasn't valid");
				}

				break;
			}

			case "del_student": {
				async function run() {
					//checking if the save as parameter is valid and can be found in the internal_storage
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
						//delete the student also from the internal_storage
						internal_storage[saveas] = null;
					} else if (!client_validity) {
						console.log("The saveas name is invalid");
					}
				}
				//will also check if the number of parameters is valid
				if (params.length == 2) {
					const fifthPromise = await run();
				} else if (params.length != 2) {
					console.log("The number of parameters is not valid");
				}

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
					//rest the internal_storage after the delete all action
					if (Object.keys(internal_storage).length > 0) {
						console.log("The");
						objectLength = Object.keys(internal_storage).length;
						console.log(
							"The number of objects in the internal storage is " + objectLength
						);
						//delete all the students also from the internal_storage as well because they are not in the data base anymore
						//so they are not valid anymore
						for (var prop in internal_storage) {
							delete internal_storage[prop];
						}
					}
					objectLength = Object.keys(internal_storage).length;
					console.log(
						"The number of objects in the internal storage is " + objectLength
					);
				}
				if (params.length == 1) {
					const sixthPromise = await run();
				} else if (params.length != 1) {
					console.log("The number of parameters is not valid");
				}

				break;
			}
			default:
				console.log(`Unrecognized command line (ignored):${line}`);
		}
	}
}
//check what is the file type and allowing only txt files and if
//it receives a file that is not txt it will print an error message
console.log(file);
if (path.extname(file) == ".txt") {
	processLineByLine(file);
} else if (path.extname(file) != ".txt") {
	console.log("Only text files are allowed!");
}
