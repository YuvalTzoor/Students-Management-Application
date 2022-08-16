const http = require("http");

function httpJSONRequest(method, url, body = null) {
	/* 
    This function is adapted from:
    https://stackoverflow.com/questions/38533580/nodejs-how-to-promisify-http-request-reject-got-called-two-times
    It was tailored to:
      1) work with any type of HTTP request
      2) work in JSON mode only (both for sending and receiving)
      3) receieve only (JSON) strings, not buffers
      4) return only the body (the payload) and not the HTTP headers
    At the bottom of thie page, one can find examples the show how to use this module.
    */
	let urlObject;

	try {
		urlObject = new URL(url);
	} catch (error) {
		throw new Error(`Invalid url ${url}`);
	}

	if (body && method !== "post" && method !== "put") {
		throw new Error(
			`Invalid use of the body parameter while using the ${method.toUpperCase()} method.`
		);
	}

	let options = {
		method: method.toUpperCase(),
		hostname: urlObject.hostname,
		port: urlObject.port,
		path: urlObject.pathname,
		headers: {
			"Content-Type": "application/json",
			"Content-Length": body ? body.length : 0,
		},
	};
	return new Promise((resolve, reject) => {
		const clientRequest = http.request(options, (incomingMessage) => {
			let response_data = "";
			// Collect response body data.
			incomingMessage.on("data", (chunk) => {
				response_data += chunk;
			});
			// Resolve on end.
			incomingMessage.on("end", () => {
				if (response_data.length) {
					try {
						response_data = JSON.parse(response_data);
					} catch (error) {
						// Silently fail if response_data is not JSON.
					}
				}
				resolve(response_data);
			});
		});

		// Reject on request error.
		clientRequest.on("error", (error) => {
			reject(error);
		});

		// Write request body if present.
		if (body) {
			clientRequest.write(body);
		}

		// Close HTTP connection.
		clientRequest.end();
	});
}

module.exports = httpJSONRequest;

/*
To use this module in some other file you should first require it:
const httpJSONRequest = require('./httpJSONRequest'); // assuming both files in the same folder
To call a server in some url, say in POST, you should first have the payload data, 
that is, the data you want to send to the server. The data should be in a JSON format! (but
of course, if you already have the data in a JSON format, no need to do JSON.stringify()).
const method = 'post';
const url = 'http://localhost:8080/user"; // this is only an example of a URL
const the_data = JSON.stringify({fld1:'val1',fld2:33}); // this is only an example of the data
Then, construct the Promise that does the server calling:
const pr = httpJSONRequest(method,url,the_data);
Then, await the promise to be fulfilled and get the result that it returnes:
const res = await pr;
Of course, you can do this in one command, instead:
const res = await httpJSONRequest(method,url.the_data);
Remember: awaiting the Promise should be performed from within an async function.
*/
