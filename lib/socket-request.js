var URL = require('url');
var hasOwnProperty = Object.prototype.hasOwnProperty;

function decode_param(val) {
    if (typeof val !== 'string') {
        return val;
    }

    try {
        return decodeURIComponent(val);
    } catch (e) {
        var err = new TypeError("Failed to decode param '" + val + "'");
        err.status = 400;
        throw err;
    }
}

var SocketRequest = module.exports = function(opts) {
    this.opts = opts || {};
    this._reqData = opts.data;
    this.url = this._reqData.url;
    this.baseURL = this.url.split('?')[0];
    this.data = this._reqData.data || null;
    this.urlParts = URL.parse(this.url, true);
    this.requestId = this._reqData.requestId;
    this.type = this._reqData.type || 'GET';
};

SocketRequest.prototype.setRequestHandler = function(handlerConf) {
    this._handler = handlerConf.handler;
    this._routeRexp = handlerConf.regexp;
    this._matches = handlerConf.matches;
    this._keys = handlerConf.keys;
};

SocketRequest.prototype.setResponse = function(resp) {
    this._response = resp;
    this._response.requestId = this.requestId
};

SocketRequest.prototype.param = function(name) {
    return this.params[name];
};

SocketRequest.prototype.handle = function() {
    // store values
    this.query = this.urlParts.query || {};
    this.params = {};
    this.path = this._matches[0];

    var prop;
    var n = 0;
    var key;
    var val;

    for (var i = 1, len = this._matches.length; i < len; ++i) {
        key = this._keys[i - 1];
        prop = key
            ? key.name
            : n++;
        val = decode_param(this._matches[i]);

        if (val !== undefined || !(hasOwnProperty.call(this.params, prop))) {
            this.params[prop] = val;
        }
    }

    this._handler(this, this._response);
};