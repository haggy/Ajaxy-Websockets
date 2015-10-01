var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var SocketRouter = require('../index.js');

Router = new SocketRouter(server);

app.get('/', function(req, res){
  res.sendfile(__dirname+'/index.html');
});



server.listen(3000);
