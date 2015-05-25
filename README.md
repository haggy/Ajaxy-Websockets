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
    socket.get('/api/some_object/1234567', function(data) {
        console.log(data); // "Hello from ID 1234567"
    });
});
```

## Dependencies

* [Socket.io](https://www.npmjs.com/package/socket.io)