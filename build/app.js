"use strict";
var LiteEvent = (function () {
    function LiteEvent() {
        this._handlers = [];
    }
    LiteEvent.prototype.one = function (handler) {
        var _this = this;
        var oneHendler = function (sender, args) {
            handler(sender, args);
            _this.off(oneHendler);
        };
        this.on(oneHendler);
    };
    LiteEvent.prototype.on = function (handler) {
        this._handlers.push(handler);
    };
    LiteEvent.prototype.off = function (handler) {
        if (!handler.guid) {
            this._handlers = this._handlers.filter(function (h) { return h !== handler; });
        }
        else {
            this._handlers = this._handlers.filter(function (h) { return h.guid !== handler.guid; });
        }
    };
    LiteEvent.prototype.clean = function () {
        this._handlers = [];
    };
    LiteEvent.prototype.trigger = function (sender, args) {
        this._handlers.forEach(function (h) { return h(sender, args); });
    };
    return LiteEvent;
}());
exports.LiteEvent = LiteEvent;

//# sourceMappingURL=app.js.map
