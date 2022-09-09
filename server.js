global.workMode = "";
let tempWmode = process.argv[2];
console.log("workMode is " + tempWmode);
const express = require("express");
const path = require("path");
const { default: mongoose } = require("mongoose");
//const uri = "mongodb://localhost:27017/academy";
global.Student = require("./models/student_model");
global.Log = require("./models/log_model");
global.conn1 = mongoose.createConnection("mongodb://localhost/academy");
global.conn2 = mongoose.createConnection("mongodb://localhost/academylog");
let app = express();
const PORT = 8080;

//Import user router
const student_router = require("./routes/student");
const { ifError } = require("assert");

//Static middleware
app.use(express.static(path.join(__dirname, "public")));
if (tempWmode == "--json") {
	global.workMode = "JSON";
} else if (tempWmode == "--html") {
	global.workMode = "HTML";
}
if (global.workMode == "JSON") {
	app.use(express.json());
} else if (global.workMode == "HTML") {
	app.use(express.urlencoded({ extended: false }));
}

//Router middleware
app.use("/student", student_router);
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
// if (process.argv[2] == "HTML") {
// 	global.workMode = "HTML";
// } else if (process.argv[2] == "JSON") {
// 	global.workMode = "JSON";
// }

//DB connection func
async function run() {
	// await mongoose.connect(uri);
	app.listen(PORT, () => console.log(`Listening to ${PORT}`));
}
run().catch((err) => console.log(err));
