Poller
======

[![Build Status](https://travis-ci.org/Anephenix/poller.svg?branch=master)](https://travis-ci.org/Anephenix/poller)
[![Dependency Status](https://david-dm.org/anephenix/poller.png)](https://david-dm.org/anephenix/poller)
[![devDependency Status](https://david-dm.org/anephenix/poller/dev-status.png)](https://david-dm.org/anephenix/poller#info=devDependencies)
[![Coverage Status](https://img.shields.io/coveralls/Anephenix/poller.svg)](https://coveralls.io/r/Anephenix/poller?branch=master)
[![Code Climate](https://codeclimate.com/github/Anephenix/poller.png)](https://codeclimate.com/github/Anephenix/poller)

A FileSystem poller for Node.js

Summary
---

This was developed as a reliable alternative to using file watching libraries like Chokidar and Node Watch.

Install
---

    npm install poller

Usage
---

```javascript
// Require the library
var poller = require('poller');

// Poll a file directory
poller('/tmp/myFolder', function (err, poll) {

    // Log every time a file is added into the folder
    poll.on('add', function (filePath) {
        console.log(filePath,'was added');
    });

    // Log every time a file is removed from the folder
    poll.on('remove', function (filePath) {
        console.log(filePath,'was removed');
    });

    // Stop polling the folder for file adds/removals
    poll.close();

});


// Poll a file directory at an interval of 50ms (the default is 100ms)
poller('/tmp/myFolder', {interval: 50}, function (err, poll) {
    
});
```

Licence and Rights
---

&copy; 2014 Anephenix Ltd. Poller is licenced under the MIT license. - See LICENSE for details.