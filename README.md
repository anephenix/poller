Poller
======

[![Build Status](https://travis-ci.org/Anephenix/poller.svg?branch=master)](https://travis-ci.org/Anephenix/poller)

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

});
```

Licence and Rights
---

&copy;2014 Anephenix Ltd. Poller is licenced under the MIT license. - See LICENSE for details.