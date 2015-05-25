var SocketResponse = module.exports = function(opts) {
    this.opts = opts;
    // True if response has been sent
    this.closed = false;
    // Request ID that's set on incoming request
    this.requestId = null;
};

SocketResponse.prototype.send = function(data) {
    if(this.closed) {
        throw 'Response has already been sent!';
    }

    this.opts.socket.emit('ajaxy_resp', {
        requestId: this.requestId,
        data: data
    });
    this.closed = true;
};

SocketResponse.prototype.json = function(data) {
    this.send(data);
};

SocketResponse.prototype.end = function(data) {
    if(data) {
        this.send(data);
    } else if(!this.closed) {
        this.send(null);
    }
};