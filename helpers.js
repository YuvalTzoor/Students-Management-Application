const textfilter = function (req, file, cb) {
	// Accept images only
	if (!file.originalname.match(/\.(txt)$/)) {
		req.fileValidationError = "Only text files are allowed!";
		return cb(new Error("Only image files are allowed!"), false);
	}
	cb(null, true);
};
exports.textfilter = textfilter;
