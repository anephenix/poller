'use strict';



// Dependencies
//
var fs = require('fs');



// Returns the poller function for calling from Node's require interface
//
// @param folderPath  String    The path for the folder
// @param cb          Function  The function to execute once finished
//
function poller (folderPath, cb) {

	if (!folderPath) {
		var argumentType = typeof folderPath;
		return cb(new Error('You need to pass a folder path, you passed an argument with type: ' + argumentType));
	}

	fs.exists(folderPath, function (exists) {
		if (!exists) {
			cb(new Error('This folder does not exist: ' + folderPath));
		}
	});

}



// Return the poller function as the public API
//
module.exports = poller;