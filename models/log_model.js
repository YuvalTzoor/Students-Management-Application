const mongoose = require("mongoose");

const log_schema = new mongoose.Schema(
	{
		method: {
			type: String,
		},
		path: {
			type: String,
		},
		runmode: {
			type: String,
		},
		when: {
			type: Date,
			default: Date.now,
		},
	},
	{ collection: "academylog" }
);

const Log = mongoose.model("log_schema", log_schema);
module.exports = Log;
