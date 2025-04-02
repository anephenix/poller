// Dependencies
import { EventEmitter } from 'events';
import * as fs from 'fs';
import { difference } from './helpers';
import { Poller, PollerCallback, PollerOptions } from './types';

/*
	Returns the poller function for calling from Node's require interface
  		@param folderPath  		String        		The path for the folder
  		@param optionsOrCb   	Object/Function  	Either the options for the poller, or the function to execute once finished
  		@param cb      			Function      		The function to execute once finished
*/
function poller(
	folderPath: string,
	optionsOrCb: PollerOptions | PollerCallback,
	cb?: PollerCallback
): void {
	// We set the callback to the 2nd argument, if no options are passed
	if (typeof optionsOrCb === 'function') {
		cb = optionsOrCb;
	}

	if (!folderPath) {
		// return an error explaining that the user needs to pass a folder path as the 1st argument
		const argumentType = typeof folderPath;
		return cb?.(
			new Error(
				`You need to pass a folder path, you passed an argument with type: ${argumentType}`
			)
		);
	}

	fs.open(folderPath, error => {
		// return an error if the folder does not exist
		if (error) return cb?.(new Error(`This folder does not exist: ${folderPath}`));

		fs.stat(folderPath, (err, stats) => {
			if (err) return cb?.(err);

			// return an error if the path is not a folder
			if (!stats.isDirectory())
				return cb?.(new Error(`The path you passed is not a folder: ${folderPath}`));

			// Generate a polling event emitter
			const poll = new EventEmitter() as Poller;

			// Get the initial list of files in the folder
			fs.readdir(folderPath, (err, files) => {
				if (err) return cb?.(err);

				poll.files = files;

				// Setup the internal watch function
				poll.watch = () => {
					// If an interval option was passed, use that number as the interval,
					// otherwise default to 100ms
					const interval: number = (optionsOrCb as PollerOptions).interval || 100;

					// Setup the interval function
					poll.timeout = setInterval(() => {
						fs.readdir(folderPath, (err, files) => {
							if (err) {
								throw err;
							}

							// Get the list of files that have been added or removed
							const addedFiles = difference(files, poll.files);
							const removedFiles = difference(poll.files, files);

							if (addedFiles.length > 0) {
								// Emit an add event with the full path of the added file
								addedFiles.forEach(addedFile => {
									poll.emit('add', `${folderPath}/${addedFile}`);
								});
							}

							if (removedFiles.length > 0) {
								// Emit a remove event with the full path of the removed file
								removedFiles.forEach(removedFile => {
									poll.emit('remove', `${folderPath}/${removedFile}`);
								});
							}

							// Set the list of tracked files to the files that were polled
							poll.files = files;
						});
					}, interval);
				};

				// Sets a function to allow the user to stop the polling
				poll.close = () => {
					clearInterval(poll.timeout);
				};

				// Calls the internal watch function to get the polling started
				poll.watch();

				// returns the error and poll variables to the user
				cb?.(null, poll);
			});
		});
	});
}

// Export the poller function as the public API
export default poller;
