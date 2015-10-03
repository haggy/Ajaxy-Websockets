var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var SocketRouter = require('../index.js');

Router = SocketRouter(io, server);

app.get('/', function(req, res){
  res.sendfile(__dirname+'/index.html');
});

Router.get('/api/some_object/:id', function(req, res) {
    console.log("reached");
    res.send("Hello from ID " + req.params.id);
});

server.listen(3000);
