// general utilities
var express = require("express"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	html = require("html"),
	url = require("url"),
	qstring = require("querystring");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
//
var app = express();

app.use(urlencodedParser);
//
// the st management router which will be mounted on the app's student Router
const client_router = require("./routes/client");
app.use("/client", client_router);
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);

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
