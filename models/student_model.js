const mongoose = require("mongoose");

const take_course_schema = new mongoose.Schema({
	cid: {
		String,
		required: true,
		validate: { validator: (v) => v.length == 5 && v.trim() != "" },
	},
	grade: {
		Number,
		required: true,
		min: 0,
		max: 100,
	},
});

const student_schema = new mongoose.Schema(
	{
		id: {
			String,
			required: true,
			validate: { validator: (v) => v.length == 9 && v.trim() != "" },
		},
		name: {
			String,
			required: true,
			validate: { validator: (v) => v.length == 1 && v.trim() != "" },
		},
		city: {
			String,
			validate: { validator: (v) => v.length == 1 && v.trim() != "" },
		},
		toar: {
			String,
			required: true,
			enum: ["ba", "ma", "phd"],
		},
		courses: [take_course_schema],
	},
	{ collection: "Academy" }
);

const user = mongoose.model("", student_schema);

module.exports = user;
