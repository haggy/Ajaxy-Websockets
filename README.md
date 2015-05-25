# AJAXy Websockets

Familiar with node http and Express web servers? AJAXy Websockets enables you to do things like this!

```javascript
// On the server
var io = require('socket.io')(server);
var socketRouter = new AjaxySocketRouter(io);

// This is using websockets, not HTTP!
socketRouter.get('/api/simple_object/:id', function(req, res) {
    res.send('Hello from ID ' + req.params.id);
});
```