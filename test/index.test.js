'use strict';



// Dependencies
//
var assert			= require('assert');
var eventEmitter	= require('events').EventEmitter;
var fs				= require('fs');
var path			= require('path');
var poller			= require('../index');



describe('require("poller")', function () {



	it('should return a function that can be used to poll a directory', function (done) {

		assert(typeof poller === 'function');
		done();

	});



});



describe('poller(path);', function () {



	describe('when no folder path is passed', function () {



		it('should return an error, warning the developer that they need to pass a folder path', function (done) {

			poller(undefined, function (err) {
				assert.notEqual(null, err);
				assert.equal('You need to pass a folder path, you passed an argument with type: undefined', err.message);
				done();
			});

		});



	});



	describe('when a non-existent folder path is passed', function () {



		it('should return an error, warning the developer that the folder path does not exist', function (done) {

			var nonExistentFolder = '/tmp/non-existent';
			poller(nonExistentFolder, function (err) {
				assert.notEqual(null, err);
				assert.equal('This folder does not exist: '+nonExistentFolder, err.message);
				done();
			});

		});



	});



	describe('when an invalid folder path is passed', function () {



		it('should return an error, warning the developer that the folder path is not a folder', function (done) {

			var notaFolderPath = __filename;
			poller(notaFolderPath, function (err) {
				assert.notEqual(null, err);
				assert.equal('The path you passed is not a folder: ' + notaFolderPath, err.message);
				done();
			});

		});



	});



	describe('when passed a valid folder path', function () {



		it('should return an event emitter', function (done) {

			var folderPath = path.join(__dirname, './example');
			poller(folderPath, function (err, poll) {
				assert.equal(null, err);
				assert(poll instanceof eventEmitter);
				assert(typeof poll === 'object');
				done();
			});


		});



		describe('when a file is added within the folder', function () {


			beforeEach(function (done) {

				var folderPath = path.join(__dirname, './example');
				var filePath   = path.join(folderPath,'testFile.txt');

				fs.exists(filePath, function (exists) {
					if (exists) {
						return fs.unlink(filePath, done);
					}

					done();
				});


			});



			it('should emit an add event from the poll event emitter', function (done) {

				var folderPath = path.join(__dirname, './example');
				var filePath   = path.join(folderPath,'testFile.txt');
				poller(folderPath, function (err, poll) {

					poll.on('add', function (addedFilePath) {
						assert.equal(filePath, addedFilePath);
						done();
					});

					fs.writeFile(filePath, 'Hello World', function (err) {
						if (err) { throw err; }
					});

				});

			});



		});



		describe('when a file is removed from within the folder', function () {



			it('should emit a remove event from the poll event emitter', function (done) {

				var folderPath = path.join(__dirname, './example');
				var filePath   = path.join(folderPath,'testFile.txt');

				fs.writeFile(filePath, 'Hello World', function (err) {

					if (err) { throw err; }

					poller(folderPath, function (err, poll) {

						poll.on('remove', function (removedFilePath) {
							assert.equal(filePath, removedFilePath);
							done();
						});

						fs.unlink(filePath, function (err) {
							if (err) { done(err); }
						});

					});

				});

			});



		});



		describe('poll.close();', function () {



			it('should clear the timeout so that we are not polling the folder anymore', function (done) {

				var folderPath = path.join(__dirname, './example');

				poller(folderPath, function (err, poll) {

					poll.on('add', function () {
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



describe('poller(path, {options});', function () {



	describe('interval option', function () {



		it('should allow the user to control the interval time between polling checks', function (done) {

			var folderPath = path.join(__dirname, './example');

			poller(folderPath, {interval: 50}, function (err, poll) {

				poll.on('add', function () {
					done(new Error('a file add was recorded when it should not have'));
				});

				assert.equal(50, poll.timeout._idleTimeout);
				done();

			});


		});



	});



});
