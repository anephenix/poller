'use strict';



// Dependencies
//
var eventEmitter = require('events').EventEmitter;
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
			return cb(new Error('This folder does not exist: ' + folderPath));
		}

		fs.stat(folderPath, function (err, stats) {

			if (err) {
				console.log('err occurred');
				console.log(err);
				console.log('/err');
				return cb(err);
			}
			if (!stats.isDirectory()) return cb(new Error('The path you passed is not a folder: ' + folderPath));

			// Now you can start polling this
			var poll = new eventEmitter();
			cb(null, poll);

		});


	});



}



// Return the poller function as the public API
//
module.exports = poller;