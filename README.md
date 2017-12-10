# Poller

[![Greenkeeper badge](https://badges.greenkeeper.io/anephenix/poller.svg)](https://greenkeeper.io/)
[![NPM version](https://badge.fury.io/js/poller.svg)](http://badge.fury.io/js/poller)
[![Build Status](https://travis-ci.org/anephenix/poller.svg?branch=master)](https://travis-ci.org/Anephenix/poller)
[![Dependency Status](https://david-dm.org/anephenix/poller.svg)](https://david-dm.org/anephenix/poller)
[![devDependency Status](https://david-dm.org/anephenix/poller/dev-status.svg)](https://david-dm.org/anephenix/poller#info=devDependencies)
[![Coverage Status](https://img.shields.io/coveralls/anephenix/poller.svg)](https://coveralls.io/r/Anephenix/poller?branch=master)
[![Code Climate](https://codeclimate.com/github/Anephenix/poller.svg)](https://codeclimate.com/github/Anephenix/poller)
[![Codacy Badge](https://www.codacy.com/project/badge/30844a27cd944d5c8ed7770a5280ea4f)](https://www.codacy.com/public/Anephenix/poller.git)

A FileSystem poller for Node.js

### Summary

This was developed as a reliable alternative to using file watching libraries like Chokidar and Node Watch.

### Install

    npm install poller

### Usage

```javascript
// Require the library
const poller = require('poller');

// Poll a file directory
poller('/tmp/myFolder', (err, poll) => {
	// Log every time a file is added into the folder
	poll.on('add', filePath => {
		console.log(filePath, 'was added');
	});

	// Log every time a file is removed from the folder
	poll.on('remove', filePath => {
		console.log(filePath, 'was removed');
	});

	// Stop polling the folder for file adds/removals
	poll.close();
});

// Poll a file directory at an interval of 50ms (the default is 100ms)
poller('/tmp/myFolder', { interval: 50 }, (err, poll) => {});
```

### Licence and Rights

&copy; 2017 Anephenix Ltd. Poller is licenced under the MIT license. - See LICENSE for details.
