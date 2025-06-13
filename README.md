# Poller

[![NPM version](https://badge.fury.io/js/poller.svg)](http://badge.fury.io/js/poller) [![Node.js CI](https://github.com/anephenix/poller/actions/workflows/node.js.yml/badge.svg)](https://github.com/anephenix/poller/actions/workflows/node.js.yml) [![Socket Badge](https://socket.dev/api/badge/npm/package/poller)](https://socket.dev/npm/package/poller)


A FileSystem poller for Node.js.

### Dependencies

- Node.js (v22+)

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

&copy; 2025 Anephenix OÜ. Poller is licenced under the [MIT license](/LICENSE).
