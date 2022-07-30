const fs = require("fs");
const readline = require("readline");
const httpJSONRequest = require("./httpJSONRequest");
//
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
				// handle adding a student
				break;
			case "get_students":
				// handle retrieving students
				//break;
				//case ...:
				//break;
				//case ...:
				//21
				break;
			default:
				console.log("Unrecognized command (ignored):", line);
		}
	}
}
// For this app. to work, here you should call processLineByLine(..)
// and give it the name of the input file
