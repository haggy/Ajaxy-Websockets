# AJAXy Websockets

Familiar with node http and Express web servers? AJAXy Websockets enables you to do things like this!

```javascript
/***** On the server *****/
var io = require('socket.io')(server);
var socketRouter = new AjaxySocketRouter(io);

// This is using websockets, not HTTP!
socketRouter.get('/api/some_object/:id', function(req, res) {
    res.send("Hello from ID " + req.params.id);
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

### Gracefullly degrade to AJAX requests if sockets aren't available
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

__Dev Note:__ This is still in it's early stages so take care if you plan to use this in production apps. See the roadmap
below for what needs to be implemented.

## Dependencies

* [Socket.io](https://www.npmjs.com/package/socket.io)

## The full setup
This solution does require the use of socket.io (shouldn't be a huge deal since it's the most popular sockets library on NPM).
This can be used with or without Express.

__On the server:__

```javascript
var AjaxySocketRouter = require('ajaxy-websockets');

// Instantiate a basic web server
var server = require('http').createServer(function(request, response) {
    // Regular req/response stuff goes here
});

// Require socket.io and pass it to an instance of ajaxy sockets
var io = require('socket.io')(server);
var socketRouter = new AjaxySocketRouter(io);

```

__On the client:__
Make sure to copy the ajaxy websocket client (from the `client` folder in npm module) to somewhere accessible to the browser.

```html
<!DOCTYPE html>
<html>
    <head lang="en">
        <meta charset="UTF-8">
        <title>Websockets routing!</title>

        <!-- load in Socket.io client -->
        <script src="https://cdn.socket.io/socket.io-1.1.0.js"></script>
        <!-- load in AjaxySocket -->
        <script src="/my/path/to/ajaxy-websocket-client.js"></script>
    </head>
    <body>
        <button id="my-button">Gimme socket data!</button>
    </body>
    <script>
        // Your socket server address
        var host = 'ws:127.0.0.1:8888';
        var socket = new AjaxySocket({
            socketURL: host
        });
        socket.start();

        // Setup done. Start using it!

        // When user clicks the button, get data for ID 1234567 from websocket!
        $('#my-button').click(function() {
            socket.get('/api/some_object/1234567', function(response) {
                console.log(response.data); // "Hello from ID 1234567"
            });
        });
    </script>
</html>
```

That's it! It can also be used with express.

```javascript
var express = require('express');

// Setup express app
var app = express();
app.use( ... );

// Now with express setup, just create an HTTP webserver 
// (passing it express app) and the rest is the same as before!
var server = require('http').createServer(app);

// Require socket.io and pass it to an instance of ajaxy sockets
var io = require('socket.io')(server);
var socketRouter = new AjaxySocketRouter(io);

```

Need to secure sockets with authentication using things like passport for Socket.io? No problem!

```javascript
// Basic socket.io setup
var io = require('socket.io')(server);

// Use the socket.io bundle and passport libs
var socketIOBundle = require('socket.io-bundle');
var socketIOPassport = require('socket.io-passport');
// Setup auth
io.use(socketIOBundle.cookieParser());
io.use(socketIOBundle.session({
    secret: 'MY_SUPER_SECRET_STRING',
    key: 'sid'
}));
io.use(socketIOPassport.initialize());
io.use(socketIOPassport.session());

// Create AjaxySocketRouter the regular way
var ajaxySocketsRouter = new AjaxySocketRouter(io);
```

## API

### Server side AjaxySocketsRouter

`constructor`

* Params
  * __Server__ server instance

`get`
Setup a handler for GET type requests

* Params: 
  * __string__ route
  * __function__ handler

`post`
Setup a handler for POST type requests

* Params: 
  * __string__ route
  * __function__ handler

`patch`
Setup a handler for PATCH type requests

* Params: 
  * __string__ route
  * __function__ handler

`del`
Setup a handler for DELETE type requests

* Params: 
  * __string__ route
  * __function__ handler

### Client side AjaxySocket

`constructor`

* Params
  * __string__ socketURL - The URI for websocket server (ex. ws://127.0.0.1:8888)

`start`
Inits the websocket. Must be called when you want the socket to connect to the server.

* Params NONE

`get`
Make a GET type request to the socket server

* Params
  * __string__ url - The request url
  * __function__ callback - The callback which is executed when the socket receives a response

`post`
Make a POST type request to the socket server

* Params
  * __string__ url - The request url
  * __function__ callback - The callback which is executed when the socket receives a response

`patch`
Make a PATCH type request to the socket server

* Params
  * __string__ url - The request url
  * __function__ callback - The callback which is executed when the socket receives a response

`del`
Make a DELETE type request to the socket server

* Params
  * __string__ url - The request url
  * __function__ callback - The callback which is executed when the socket receives a response

`ajaxyRequest`
Makes a request based on the options object passed to it (similiar to jQuery `$.ajax()` method)

* Params
  * __object__ options - An object with the following properties:
    * __string__ url
    * __string__ method - The request type (GET, POST, etc)
    * __object__ data - (optional) The data to be passed with the request
  * __function__ callback - Exectued when the response is received

## Roadmap

* Add good error handling
* Promises!
* Add various methods to request/response classes that are available in Express req/response
