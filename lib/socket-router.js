var SocketRequest = require(__dirname + '/socket-request');
var SocketResponse = require(__dirname + '/socket-response');
var pathToRegexp = require('path-to-regexp');

var SocketRouter = module.exports = function(server) {
    this._server = server;
    this.routes = [];
    this.sockets = {};
    this._init();
};

SocketRouter.prototype._init = function() {
    this._server.on('connection', function(socket){
        socket.on('ajaxy_req', function(data) {
            this._handleMessage(this.sockets[socket.id], data);
        }.bind(this));

        socket.on('disconnect', function(){});
        socket.on('error', function(err) {
            throw err;
        });

        this.sockets[socket.id] = socket;
    }.bind(this));

};

SocketRouter.prototype._handleMessage = function(socket, data) {
    var req = new SocketRequest({data: data});

    var matches = null;
    // TODO: This could match multiple routes
    var routeHandler = this.routes.filter(function(routeHandler) {
        if(routeHandler.type !== req.type) {
            return false;
        }

        var currMatches = routeHandler.regexp.exec(req.baseURL);

        if(currMatches) {
            matches = currMatches;
        }
        return matches;
    })[0];

    if(routeHandler) {
        req.setRequestHandler({
            handler: routeHandler.handler,
            regexp: routeHandler.regexp,
            keys: routeHandler.keys,
            matches: matches
        });
        req.setResponse(new SocketResponse({socket: socket}));
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
