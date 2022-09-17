global.workMode = "";
let tempWmode = process.argv[2];
console.log("workMode is " + tempWmode);
const Log = require("./models/log_model");
const express = require('express');
const path = require('path');
const { default: mongoose } = require('mongoose');
const uri = 'mongodb://localhost:27017/academy';
global.conn1 = mongoose.createConnection("mongodb://localhost/academy");
global.conn2 = mongoose.createConnection("mongodb://localhost/academylog");
let app = express()

const PORT = 8080;

// Import user router
const student_router = require('./routes/student')

// Static middleware
app.use(express.static(path.join(__dirname,'public')))

if (tempWmode == "--json") {
	global.workMode = "JSON";
} else{
	global.workMode = "HTML";
}
if (global.workMode == "JSON") {
	app.use(express.json());
} else if (global.workMode == "HTML") {
	app.use(express.urlencoded({ extended: false }));
}

// Router middleware
app.use('/student', student_router);
app.use('/',async (req,res)=>{
	const log_model = conn2.model("log_schema", Log.schema);
	const log = new log_model({
		method:req.method ,
		path: req.path,
		runmode: global.workMode
	})
	await log.save();
	console.log(log);
	next()
})

// PUG connection to the app
app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'views') )

// A general message for illegal paths
app.use('*', (req,res)=>{
	res.send("Illegal path").status(404)
})


// DB connection func
async function run(){
  await mongoose.connect(uri);
  app.listen(PORT,()=>console.log(`Listening to ${PORT}`))
}
run().catch(err=>console.log(err))