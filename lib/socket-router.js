var SocketRequest = require(__dirname + '/socket-request');
var SocketResponse = require(__dirname + '/socket-response');
var fs = require('fs');
var pathToRegexp = require('path-to-regexp');

var SocketRouter = module.exports = function(io, server) {

  if(!(this instanceof SocketRouter))
      return new SocketRouter(io, server);

  this._server = io;
  this._http = server;
  this.routes = [];
  this.sockets = {};
  this._init();
  var resolved = require.resolve('../ajaxy-client.js');
  this.client_source = clientSource = fs.readFileSync(resolved, 'utf-8');

  var attachServe = function(srv) {
    //debug('attaching client serving req handler');
    var url = '/ajaxy/ajaxyclient.js';
    var evs = srv.listeners('request').slice(0);
    var self = this;
    srv.removeAllListeners('request');
    srv.on('request', function(req, res) {
      if (0 === req.url.indexOf(url)) {
        serve(req, res);
      } else {
        for (var i = 0; i < evs.length; i++) {
          evs[i].call(srv, req, res);
        }
      }
    });
  };

  function serve(req, res) {
    var etag = req.headers['if-none-match'];
    res.setHeader('Content-Type', 'application/javascript');
    res.writeHead(200);
    res.end(clientSource);
  }

  attachServe(this._http);
};

SocketRouter.prototype._init = function() {
  this._server.on('connection', function(socket) {
    console.log("on connection");
    socket.on('ajaxy_req', function(data) {
      this._handleMessage(this.sockets[socket.id], data);
    }.bind(this));

    socket.on('disconnect', function() {});
    socket.on('error', function(err) {
      throw err;
    });
    //https://github.com/socketio/socket.io/blob/master/lib/index.js line 250
    this.sockets[socket.id] = socket;
  }.bind(this));


};


SocketRouter.prototype._handleMessage = function(socket, data) {
  var req = new SocketRequest({
    data: data
  });

  var matches = null;
  // TODO: This could match multiple routes
  var routeHandler = this.routes.filter(function(routeHandler) {
    if (routeHandler.type !== req.type) {
      return false;
    }

    var currMatches = routeHandler.regexp.exec(req.baseURL);

    if (currMatches) {
      matches = currMatches;
    }
    return matches;
  })[0];

  if (routeHandler) {
    req.setRequestHandler({
      handler: routeHandler.handler,
      regexp: routeHandler.regexp,
      keys: routeHandler.keys,
      matches: matches
    });
    req.setResponse(new SocketResponse({
      socket: socket
    }));
    req.handle();
  } else {
    throw 'Unable to route this request!\n' + req;
  }

};

SocketRouter.prototype._addTypeHandler = function(type, route, handler) {
  var keys = [];
  var regexpr = pathToRegexp(route, keys);
  this.routes.push({
    regexp: regexpr,
    keys: keys,
    handler: handler,
    type: type
  });
};

SocketRouter.prototype.get = function(route, handler) {
  this._addTypeHandler('GET', route, handler);
};

SocketRouter.prototype.post = function(route, handler) {
  this._addTypeHandler('POST', route, handler);
};

SocketRouter.prototype.update = function(route, handler) {
  this._addTypeHandler('UPDATE', route, handler);
};

SocketRouter.prototype.patch = function(route, handler) {
  this._addTypeHandler('PATCH', route, handler);
};

SocketRouter.prototype.del = function(route, handler) {
  this._addTypeHandler('DELETE', route, handler);
};
