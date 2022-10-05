const mongoose = require("mongoose");

const take_course_schema = new mongoose.Schema({
	cid: {
		type: String,
		required: true,
		validate: { validator: (v) => v.length == 5 && v.trim() != "" },
	},
	grade: {
		type: Number,
		required: true,
		min: 0,
		max: 100,
	},
});

const student_schema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
			validate: { validator: (v) => v.length == 9 && v.trim() != "" },
		},
		name: {
			type: String,
			required: true,
			validate: { validator: (v) => v.length > 0 && v.trim() != "" },
		},
		city: {
			type: String,
			validate: { validator: (v) => v.length > 1 && v.trim() != "" },
		},
		toar: {
			type: String,
			required: true,
			enum: ["ba", "ma", "phd"],
		},
		courses: [take_course_schema],
	},
	{ collection: "Academy" }
);
//changed from user to student
const student = mongoose.model("", student_schema);

module.exports = student;
