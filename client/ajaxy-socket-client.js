var AjaxySocket = window.AjaxySocket = function(opts) {
    this.opts = opts || {};
    this.connected = false;
    // Queue of callbacks to execute when connect is complete
    this._connectQueue = [];
    // Map of RequestID --> Callback
    this._requestHandlerMap = {};

    if(!this.opts.socketURL) {
        throw 'Socket URL must be set!';
    }

    this._initOnMessage();

};
AjaxySocket.prototype = {
    _guid: function() {
        // See http://stackoverflow.com/a/2117523/2115809
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    },

    _ajaxyRequest: function(type, url) {
        var AjaxyRequest = function(opts) {
            this._onRequestComplete = function() {};
            var reqData = {};
            reqData.requestId = opts.guid;
            reqData.type = opts.type || 'GET';
            reqData.data = {};
            reqData.url = url;

            this.set = function(key, val) {
                reqData[key] = val;
            };

            this.setType = function(type) {
                reqData.type = type;
            };

            this.setRequestData = function(keyOrObj, val) {
                if(typeof keyOrObj === 'string') {
                    reqData.data[key] = val;
                } else {
                    for(var field in keyOrObj) {
                        reqData.data[field] = keyOrObj[field];
                    }
                }
            };

            this.getData = function() {
                return reqData;
            };

            this.getRequestId = function() {
                return reqData.requestId;
            };

            this.onComplete = function(cb) {
                this._onRequestComplete = function(response) {
                    cb(response, this);
                }.bind(this);
            };

            this.end = function(resp) {
                this._onRequestComplete(resp);
            };
        };

        return new AjaxyRequest({
            guid: this._guid(),
            type: type
        });
    },

    _makeRequest: function(req) {
        this._requestHandlerMap[req.getRequestId()] = req;
        this.socket.emit('ajaxy_req', req.getData());
    },

    on: function(event, cb) {
        this.socket.on(event, cb);
    },

    _initOnMessage: function() {
        var addListener = function() {
            this.on('ajaxy_resp', function(msg) {
                var req = this._requestHandlerMap[msg.requestId];
                req.end(msg.data);
                delete this._requestHandlerMap[msg.requestId];
            }.bind(this));
        }.bind(this);

        if(this.connected) {
            addListener();
        } else {
            this._connectQueue.push(addListener);
        }
    },

    start: function(cb) {
        var startedCb = function() {
            console.info('AjaxySocket started at ' + this.opts.socketURL);
            if(cb) {
                cb();
            }

            this._connectQueue.forEach(function(fn) { fn(); });
        }.bind(this);

        var WebSocket = window.io || window.WebSocket || window.MozWebSocket;
        this.socket = new WebSocket(this.opts.socketURL);
        this.on('connect', startedCb);
    },

    emit: function(evt, data) {
        this.socket.emit(evt, data);
    },

    ajaxyRequest: function(opts, cb) {
        var req = this._ajaxyRequest(opts.method, opts.url);
        req.onComplete(cb);
        req.setRequestData(opts.data);
        this._makeRequest(req, cb);
    },

    get: function(url, cb) {
        var req = this._ajaxyRequest('GET', url);
        req.onComplete(cb);
        this._makeRequest(req, cb);
    },

    post: function(url, data, cb) {
        var req = this._ajaxyRequest('POST', url);
        req.onComplete(cb);
        req.setRequestData(data);
        this._makeRequest(req, cb);
    },

    del: function(url, data, cb) {
        var req = this._ajaxyRequest('DELETE', url);
        req.onComplete(cb);
        req.setRequestData(data);
        this._makeRequest(req, cb);
    },

    patch: function(url, data, cb) {
        var req = this._ajaxyRequest('PATCH', url);
        req.onComplete(cb);
        req.setRequestData(data);
        this._makeRequest(req, cb);
    }
};