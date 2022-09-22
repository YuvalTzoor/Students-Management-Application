const mongoose = require("mongoose");

const log_schema = new mongoose.Schema(
	{
		method: {
			type: String,
      required:true
		},
		path: {
			type: String,
      required:true
		},
		runmode: {
			type: String,
      required:true
		},
		when: {
			type: Date,
			default: Date.now,
      required:true
		},
	},
	{ collection: "academylog" }
);

const Log = mongoose.model("log_schema", log_schema);
module.exports = Log;
