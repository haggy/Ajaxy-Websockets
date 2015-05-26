# AJAXy Websockets

Familiar with node http and Express web servers? AJAXy Websockets enables you to do things like this!

```javascript
/***** On the server *****/
var io = require('socket.io')(server);
var socketRouter = new AjaxySocketRouter(io);

// This is using websockets, not HTTP!
socketRouter.get('/api/some_object/:id', function(req, res) {
    res.send('Hello from ID ' + req.params.id);
});


/***** On the client *****/
// Create the socket
var socket = new AjaxySocket({
    socketURL: 'ws://127.0.0.1:3000'
});
socket.start();

// When user clicks the button, get data for ID 1234567 from websocket!
$('#my-button').click(function() {
    socket.get('/api/some_object/1234567', function(response) {
        console.log(response.data); // "Hello from ID 1234567"
    });
});
```

## Dependencies

* [Socket.io](https://www.npmjs.com/package/socket.io)

## The full setup
This solution does require the use of socket.io (shouldn't be a huge deal since it's the most popular sockets library on NPM).
This can be used with or without Express.

```javascript
var AjaxySocketRouter = require('ajaxy-sockets');

// Instantiate a basic web server
var server = require('http').createServer(function(request, response) {
    // Regular req/response stuff goes here
});

// Require socket.io and pass it to an instance of ajaxy sockets
var io = require('socket.io')(server);
var socketRouter = new AjaxySocketRouter(io);

```

That's it! This is just using a basic node HTTP web server. It can also be used with express.

```javascript
var express = require('express');

// Setup express app
var app = express();
app.use( ... );

app.get('/some/url/to/get', function(req, res) { ... });

// Now with express setup, just create an HTTP webserver 
// (passing it express app) and the rest is the same as before!
var server = require('http').createServer(app);

// Require socket.io and pass it to an instance of ajaxy sockets
var io = require('socket.io')(server);
var socketRouter = new AjaxySocketRouter(io);

```

## Gracefullly degrading to AJAX requests when sockets aren't available
The beautiful part about all this is that you can assign the exact same handler method for both sockets and AJAX!

```javascript
var myRequestHandler = function(req, res) { 
    if(req.params.id) {
        // Got an ID! Send back an "object"
        res.json({
            status: 'success',
            obj: {id: req.params.id}
        });
    } else {
        res.json({
            status: 'failed',
            message: 'Missing ID param!'
        });
    }
};

// Handle incoming socket requests
socketRouter.get('/api/some_object/:id', myRequestHandler);
// Gracefully degrade to AJAX
server.get('/api/some_object/:id', myRequestHandler);
```

## API