// general utilities
var express = require("express"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	http = require("http"),
	url = require("url"),
	qstring = require("querystring");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
//
var app = express();
app.use(urlencodedParser);
//
// the st management router which will be mounted on the app's student Router
const student_router = require("./routes/student");
app.use("/student", student_router);

const uri = "mongodb://localhost/academy",
	options = { useNewUrlParser: true };

mongoose.connect(uri, options);
var db = mongoose.connection;

db.on("error", function (err) {
	console.log("error connecting to server/db");
});
db.once("open", function () {
	console.log("Connected to MongoDB: academy");
});

var server = app.listen(8080, function () {
	console.log("Server started on port 8080");
});
