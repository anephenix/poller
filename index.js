'use strict';



// Dependencies
//
var _				= require('underscore');
var eventEmitter	= require('events').EventEmitter;
var fs				= require('fs');



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

			if (err) return cb(err);
			if (!stats.isDirectory()) return cb(new Error('The path you passed is not a folder: ' + folderPath));

			// Now you can start polling this
			var poll = new eventEmitter();

			fs.readdir(folderPath, function (err, files) {

				poll.files = files;

				poll.watch = function () {

					poll.timeout = setInterval(function () {

						fs.readdir(folderPath, function (err, files) {

							if (err) throw err;

							var addedFiles		= _.difference(files, poll.files);
							var removedFiles	= _.difference(poll.files, files);

							if (addedFiles.length > 0) {
								addedFiles.forEach(function (addedFile) { poll.emit('add', folderPath + '/' + addedFile); });
							}

							if (removedFiles.length > 0) {
								removedFiles.forEach(function (removedFile) { poll.emit('remove', folderPath + '/' + removedFile); });
							}

							poll.files = files;

						});
					}, 100);

				};



				poll.close = function () {
					clearInterval(poll.timeout);
				};



				poll.watch();

				cb(err, poll);

			});

		});


	});



}



// Return the poller function as the public API
//
module.exports = poller;