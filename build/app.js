var Helpers;
(function (Helpers) {
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
            this.on(handler);
        };
        LiteEvent.prototype.on = function (handler) {
            this._handlers.push(handler);
        };
        LiteEvent.prototype.off = function (handler) {
            this._handlers = this._handlers.filter(function (h) { return h !== handler; });
        };
        LiteEvent.prototype.clean = function () {
            this._handlers = [];
        };
        LiteEvent.prototype.trigger = function (sender, args) {
            this._handlers.forEach(function (h) { return h(sender, args); });
        };
        return LiteEvent;
    }());
    Helpers.LiteEvent = LiteEvent;
})(Helpers || (Helpers = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Helpers;
(function (Helpers) {
    (function (ObserveEventType) {
        ObserveEventType[ObserveEventType["Update"] = 0] = "Update";
        ObserveEventType[ObserveEventType["Add"] = 1] = "Add";
        ObserveEventType[ObserveEventType["Remove"] = 2] = "Remove";
    })(Helpers.ObserveEventType || (Helpers.ObserveEventType = {}));
    var ObserveEventType = Helpers.ObserveEventType;
    Helpers.setPropertyMethod = function (object, key, value) {
        object[key] = value;
    };
    function getObserve(object, elementPath) {
        var result = null;
        if (object["isObserver"]) {
            result = object;
        }
        else {
            if (typeof object === "object" && Array.isArray(object)) {
                result = new ObserverArray(object, elementPath);
            }
            else if (typeof object === "object") {
                result = new ObserverObject(object, elementPath);
            }
        }
        return result;
    }
    function regProperty(key, object, observeObject, path, data) {
        var _this = this;
        Object.defineProperty(observeObject, key, {
            get: function () {
                return data || object[key];
            },
            set: function (value) {
                var old = object[key];
                object[key] = value;
                data = getObserve(value, path);
                _this._events.trigger(_this, {
                    type: ObserveEventType.Update,
                    path: path,
                    oldValue: old,
                    newValue: value
                });
            }
        });
    }
    var ObserverArray = (function (_super) {
        __extends(ObserverArray, _super);
        function ObserverArray(object, path) {
            _super.call(this);
            this.isObserver = true;
            this._currentPath = "";
            this._events = new Helpers.LiteEvent();
            this._object = {};
            this._array = object;
        }
        ObserverArray.prototype.observe = function (handler) {
            this._events.on(handler);
            return this;
        };
        ObserverArray.prototype.unobserve = function (handler) {
            this._events.off(handler);
            return this;
        };
        ObserverArray.prototype.push = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i - 0] = arguments[_i];
            }
            var oldLength = this.length;
            for (var i = 0; i < items.length; i++) {
                var path = this._currentPath + "[" + index + "]";
                var index = oldLength++;
                regProperty(index, this, this._object, path);
                this[index] = this._object[index];
            }
            return this.length;
        };
        return ObserverArray;
    }(Array));
    var ObserverObject = (function () {
        function ObserverObject(object, path) {
            var _this = this;
            this.isObserver = true;
            this._events = new Helpers.LiteEvent();
            this._change = function (sender, args) {
                _this._events.trigger(sender, args);
            };
            this.init(object, path);
        }
        ObserverObject.prototype.observe = function (handler) {
            this._events.on(handler);
            return this;
        };
        ObserverObject.prototype.unobserve = function (handler) {
            this._events.off(handler);
            return this;
        };
        ObserverObject.prototype.regProperty = function (key, object, observeObject, path, data) {
            var _this = this;
            Object.defineProperty(observeObject, key, {
                get: function () {
                    return data || object[key];
                },
                set: function (value) {
                    var old = object[key];
                    object[key] = value;
                    data = getObserve(value, path);
                    if (data)
                        data.observe(_this._change);
                    _this._events.trigger(_this, {
                        type: ObserveEventType.Update,
                        path: path,
                        oldValue: old,
                        newValue: value
                    });
                }
            });
        };
        ObserverObject.prototype.init = function (object, path) {
            for (var key in object) {
                var elementPath = (path ? path + "." : "") + key;
                var element = object[key];
                if (object.hasOwnProperty(key)) {
                    var observe = getObserve(element, elementPath);
                    this.regProperty(key, object, this, elementPath, observe || element);
                    if (observe)
                        observe.observe(this._change);
                }
                else {
                    this[key] = element;
                }
            }
        };
        return ObserverObject;
    }());
    var Observer = (function () {
        function Observer(object) {
            var _this = this;
            this._events = new Helpers.LiteEvent();
            this._change = function (sender, args) {
                _this._events.trigger(_this._observeObject, args);
            };
            if (object) {
                this._observeObject = getObserve(object);
                this._observeObject.observe(this._change);
            }
        }
        Object.defineProperty(Observer.prototype, "object", {
            get: function () {
                return this._observeObject;
            },
            enumerable: true,
            configurable: true
        });
        Observer.prototype.observe = function (handler) {
            this._events.on(handler);
            return this;
        };
        Observer.prototype.unobserve = function (handler) {
            this._events.off(handler);
            return this;
        };
        Observer.prototype.destroy = function () {
            this._events.clean();
            this._observeObject.unobserve(this._change);
        };
        return Observer;
    }());
    Helpers.Observer = Observer;
})(Helpers || (Helpers = {}));
var obj = {
    a: 10,
    b: {
        a: 0,
        b: 2
    }
};
var obs = new Helpers.Observer(obj);
var res = obs.object;
var obs2 = new Helpers.Observer(res);
obs.observe(function (a, b) {
    console.log(a, b);
});
res.a = 12;
obs2.observe(function () {
    console.log(1111);
});
res.a = 11;
obs2.destroy();
res.a = 110;
res.b = { a: 100, b: 100 };
res.b.b = 200;

//# sourceMappingURL=app.js.map
