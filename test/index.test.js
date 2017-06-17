'use strict';

// Dependencies
//
const assert = require('assert');
const eventEmitter = require('events').EventEmitter;
const fs = require('fs');
const path = require('path');
const poller = require('../index');

describe('require("poller")', () => {
	it('should return a function that can be used to poll a directory', done => {
		assert(typeof poller === 'function');
		done();
	});
});

describe('poller(path);', () => {
	describe('when no folder path is passed', () => {
		it('should return an error, warning the developer that they need to pass a folder path', done => {
			poller(undefined, err => {
				assert.notEqual(null, err);
				assert.equal(
					'You need to pass a folder path, you passed an argument with type: undefined',
					err.message
				);
				done();
			});
		});
	});

	describe('when a non-existent folder path is passed', () => {
		it('should return an error, warning the developer that the folder path does not exist', done => {
			const nonExistentFolder = '/tmp/non-existent';
			poller(nonExistentFolder, err => {
				assert.notEqual(null, err);
				assert.equal(
					`This folder does not exist: ${nonExistentFolder}`,
					err.message
				);
				done();
			});
		});
	});

	describe('when an invalid folder path is passed', () => {
		it('should return an error, warning the developer that the folder path is not a folder', done => {
			const notaFolderPath = __filename;
			poller(notaFolderPath, err => {
				assert.notEqual(null, err);
				assert.equal(
					`The path you passed is not a folder: ${notaFolderPath}`,
					err.message
				);
				done();
			});
		});
	});

	describe('when passed a valid folder path', () => {
		it('should return an event emitter', done => {
			const folderPath = path.join(__dirname, './example');
			poller(folderPath, (err, poll) => {
				assert.equal(null, err);
				assert(poll instanceof eventEmitter);
				assert(typeof poll === 'object');
				done();
			});
		});

		describe('when a file is added within the folder', () => {
			beforeEach(done => {
				const folderPath = path.join(__dirname, './example');
				const filePath = path.join(folderPath, 'testFile.txt');

				fs.exists(filePath, exists => {
					if (exists) return fs.unlink(filePath, done);
					done();
				});
			});

			it('should emit an add event from the poll event emitter', done => {
				const folderPath = path.join(__dirname, './example');
				const filePath = path.join(folderPath, 'testFile.txt');
				poller(folderPath, (err, poll) => {
					poll.on('add', addedFilePath => {
						assert.equal(filePath, addedFilePath);
						done();
					});

					fs.writeFile(filePath, 'Hello World', err => {
						if (err) throw err;
					});
				});
			});
		});

		describe('when a file is removed from within the folder', () => {
			it('should emit a remove event from the poll event emitter', done => {
				const folderPath = path.join(__dirname, './example');
				const filePath = path.join(folderPath, 'testFile.txt');

				fs.writeFile(filePath, 'Hello World', err => {
					if (err) throw err;

					poller(folderPath, (err, poll) => {
						poll.on('remove', removedFilePath => {
							assert.equal(filePath, removedFilePath);
							done();
						});

						fs.unlink(filePath, err => {
							if (err) done(err);
						});
					});
				});
			});
		});

		describe('poll.close();', () => {
			it('should clear the timeout so that we are not polling the folder anymore', done => {
				const folderPath = path.join(__dirname, './example');

				poller(folderPath, (err, poll) => {
					poll.on('add', () => {
						done(new Error('a file add was recorded when it should not have'));
					});

					poll.close();

					assert.notEqual(true, poll.timeout._repeat);
					assert.equal(-1, poll.timeout._idleTimeout);
					assert.equal(null, poll.timeout._onTimeout);

					done();
				});
			});
		});
	});
});

describe('poller(path, {options});', () => {
	describe('interval option', () => {
		it('should allow the user to control the interval time between polling checks', done => {
			const folderPath = path.join(__dirname, './example');

			poller(folderPath, { interval: 50 }, (err, poll) => {
				poll.on('add', () => {
					done(new Error('a file add was recorded when it should not have'));
				});

				assert.equal(50, poll.timeout._idleTimeout);
				done();
			});
		});
	});
});
