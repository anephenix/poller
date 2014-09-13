'use strict';



// Dependencies
//
var _				= require('underscore');
var eventEmitter	= require('events').EventEmitter;
var fs				= require('fs');



// Returns the poller function for calling from Node's require interface
//
// @param folderPath	String				The path for the folder
// @param optionsOrCb   Object | Function	Either the options for the poller, or the function to execute once finished
// @param cb			Function			The function to execute once finished
//
function poller (folderPath, optionsOrCb, cb) {

	// We set the callback to the 2nd argument, if no options are passed
	//
	if (cb === undefined) { cb = optionsOrCb; }

	if (!folderPath) {

		// return an error explaining that the user needs to pass a folder path as the 1st argument
		//
		var argumentType = typeof folderPath;
		return cb(new Error('You need to pass a folder path, you passed an argument with type: ' + argumentType));

	}

	fs.exists(folderPath, function (exists) {

		// return an error if the folder does not exist
		//
		if (!exists) { return cb(new Error('This folder does not exist: ' + folderPath)); }

		fs.stat(folderPath, function (err, stats) {

			if (err) { return cb(err); }

			// return an error if the path is not a folder
			//
			if (!stats.isDirectory()) { return cb(new Error('The path you passed is not a folder: ' + folderPath)); }

			// Generate a polling event emitter
			//
			var poll = new eventEmitter();


			// Get the initial list of files in the folder 
			//
			fs.readdir(folderPath, function (err, files) {

				poll.files = files;


				// Setup the internal watch function
				//
				poll.watch = function () {

					var interval;

					// If an interval option was passed, use that number as the interval,
					// otherwise default to 100ms
					//
					if (typeof optionsOrCb === 'object' && typeof optionsOrCb.interval === 'number') {
						interval = optionsOrCb.interval;
					} else {
						interval = 100;
					}

					// Setup the interval function
					//
					poll.timeout = setInterval(function () {

						fs.readdir(folderPath, function (err, files) {

							if (err) { throw err; }

							// Get the list of files that have been added or removed
							// 
							var addedFiles		= _.difference(files, poll.files);
							var removedFiles	= _.difference(poll.files, files);

							if (addedFiles.length > 0) {
								// Emit an add event with the full path of the added file
								//
								addedFiles.forEach(function (addedFile) { poll.emit('add', folderPath + '/' + addedFile); });
							}

							if (removedFiles.length > 0) {
								// Emit a remove event with the full path of the removed file
								//
								removedFiles.forEach(function (removedFile) { poll.emit('remove', folderPath + '/' + removedFile); });
							}

							// Set the list of tracked files to the files that were polled
							//
							poll.files = files;

						});
					}, interval);

				};


				// Sets a function to allow the user to stop the polling
				//
				poll.close = function () {
					clearInterval(poll.timeout);
				};


				// Calls the internal watch function to get the polling started
				//
				poll.watch();

				// returns the error and poll variables to the user
				//
				cb(err, poll);

			});

		});

	});



}



// Return the poller function as the public API
//
module.exports = poller;