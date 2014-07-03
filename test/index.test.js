'use strict';



// Dependencies
//
var assert 			= require('assert');
var eventEmitter	= require('events').EventEmitter;
var path   			= require('path');
var poller 			= require('../index');



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



	});



});



describe('poller(path, {options});', function () {



	describe('interval option', function () {



		it('should allow the user to control the interval time between polling checks');



	});



});