var System;
(function (System) {
    var Accessor = (function () {
        function Accessor(obj) {
            this._object = obj;
        }
        Accessor.prototype.lookup = function (key) {
        };
        Accessor.prototype.define = function (key, descriptor) {
        };
        return Accessor;
    }());
    System.Accessor = Accessor;
})(System || (System = {}));

var System;
(function (System) {
    var AppObject = (function () {
        function AppObject() {
            var base = arguments.callee;
            while (base.caller != null && this.getType() != base.caller) {
                base = base.caller;
            }
            this._base = base;
        }
        AppObject.prototype.getBaseType = function () {
            return this._base;
        };
        AppObject.prototype.getType = function () {
            return this.constructor;
        };
        AppObject.prototype.extends = function (object, replace) {
            for (var k in object) {
                if (object.hasOwnProperty(k) && object[k] !== undefined && (this[k] === undefined || replace)) {
                    if (this[k] !== undefined && replace && this[k].getType)
                        this[k] = this[k].extends(object[k], true);
                    else if (replace && object[k].getType)
                        this[k] = object[k].clone();
                    else
                        this[k] = object[k];
                }
            }
            return this;
        };
        AppObject.prototype.clone = function () {
            var obj = (new this["constructor"]);
            return obj.extends(this, true);
        };
        AppObject.prototype.getBase = function () {
            if (this._base) {
                var base = new this._base();
                for (var key in base) {
                    var getter = base.__lookupGetter__(key);
                    if (base.hasOwnProperty(key) || getter)
                        base[key] = this[key];
                }
                return base;
            }
            else
                return undefined;
        };
        return AppObject;
    }());
    System.AppObject = AppObject;
})(System || (System = {}));

var Helpers;
(function (Helpers) {
    var LiteEvent = (function () {
        function LiteEvent() {
            this._handlers = [];
        }
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
var Helpers;
(function (Helpers) {
    (function (ObserveEventType) {
        ObserveEventType[ObserveEventType["Update"] = 0] = "Update";
        ObserveEventType[ObserveEventType["Add"] = 1] = "Add";
        ObserveEventType[ObserveEventType["Remove"] = 2] = "Remove";
    })(Helpers.ObserveEventType || (Helpers.ObserveEventType = {}));
    var ObserveEventType = Helpers.ObserveEventType;
    var ObserverArray = (function () {
        function ObserverArray(array, path) {
            this._array = new Array();
            this._events = new Helpers.LiteEvent();
            this._currentPath = "";
            this._array = array;
            this.initArray();
            this._currentPath = path || "";
        }
        ObserverArray.prototype.observe = function (handler) {
            this._events.on(handler);
        };
        ObserverArray.prototype.unobserve = function (handler) {
            this._events.off(handler);
        };
        ObserverArray.prototype.initArray = function () {
            for (var index = 0; index < this._array.length; index++) {
                this.regProperty(index, this._currentPath);
            }
        };
        ObserverArray.prototype.regProperty = function (index, path) {
            var _this = this;
            var data;
            if (typeof this._array[index] === "object") {
                var observe = new Observer(this._array[index], path);
                observe.observe(function (obj, args) {
                    _this._events.trigger(_this._array, args);
                });
                data = observe.getObservable();
            }
            Object.defineProperty(this, index, {
                configurable: true,
                enumerable: true,
                get: function () {
                    return data || _this._array[index];
                },
                set: function (value) {
                    var old = _this._array[index];
                    _this._events.trigger(_this._array, {
                        type: ObserveEventType.Update,
                        path: path,
                        oldValue: old,
                        newValue: value
                    });
                    if (typeof value !== "object") {
                        _this._array[index] = value;
                    }
                    else {
                        _this._array[index] = value;
                        var observe = new Observer(_this._array[index], path);
                        observe.observe(function (obj, args) {
                            _this._events.trigger(_this._array, args);
                        });
                        data = observe.getObservable();
                    }
                }
            });
        };
        ObserverArray.prototype.removeProperty = function (index) {
            delete this[index];
        };
        Object.defineProperty(ObserverArray.prototype, "length", {
            get: function () {
                return this._array.length;
            },
            set: function (value) {
                this._array.length = value;
            },
            enumerable: true,
            configurable: true
        });
        ObserverArray.prototype.push = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i - 0] = arguments[_i];
            }
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var index = this._array.push(item);
                var tryIndex = index - 1;
                var path = this._currentPath + "[" + tryIndex + "]";
                this.regProperty(tryIndex, path);
                this._events.trigger(this._array, {
                    type: ObserveEventType.Add,
                    path: path,
                    newValue: this._array[tryIndex]
                });
            }
            return this.length;
        };
        ObserverArray.prototype.shift = function () {
            var index = 0;
            var value = this._array.shift();
            if (index >= 0) {
                if (this._array.length > 0) {
                    this._events.trigger(this._array, {
                        type: ObserveEventType.Remove,
                        path: this._currentPath + "[" + index + "]",
                        oldValue: value
                    });
                }
            }
            return value;
        };
        ObserverArray.prototype.unshift = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i - 0] = arguments[_i];
            }
            for (var i = items.length; i >= 0; i--) {
                var item = items[i];
                var index = this._array.unshift(item);
                var tryIndex = 0;
                var path = this._currentPath + "[" + tryIndex + "]";
                this.regProperty(tryIndex, path);
                this._events.trigger(this._array, {
                    type: ObserveEventType.Add,
                    path: path,
                    newValue: this._array[tryIndex]
                });
            }
            return this.length;
        };
        ObserverArray.prototype.splice = function (start, deleteCount) {
            var items = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                items[_i - 2] = arguments[_i];
            }
            var values = (_a = this._array).splice.apply(_a, [start, deleteCount].concat(items));
            for (var index = 0; index < values.length; index++) {
                var value = values[index];
                var trueIndex = start + index;
                this.removeProperty(trueIndex);
                var path = this._currentPath + "[" + trueIndex + "]";
                this._events.trigger(this._array, {
                    type: ObserveEventType.Remove,
                    path: path,
                    oldValue: value
                });
            }
            return values;
            var _a;
        };
        ObserverArray.prototype.pop = function () {
            var index = this._array.length - 1;
            var value = this._array.pop();
            if (index >= 0) {
                this._events.trigger(this._array, {
                    type: ObserveEventType.Remove,
                    path: this._currentPath + "[" + index + "]",
                    oldValue: value
                });
            }
            return value;
        };
        ObserverArray.prototype.join = function (separator) {
            return this._array.join(separator);
        };
        ObserverArray.prototype.reverse = function () {
            return this._array.reverse();
        };
        ObserverArray.prototype.concat = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i - 0] = arguments[_i];
            }
            return (_a = this._array).concat.apply(_a, items);
            var _a;
        };
        ObserverArray.prototype.slice = function (start, end) {
            return this._array.slice(start, end);
        };
        ObserverArray.prototype.sort = function (compareFn) {
            this._array.sort(compareFn);
            this.initArray();
            return this;
        };
        ObserverArray.prototype.indexOf = function (searchElement, fromIndex) {
            return this._array.indexOf(searchElement, fromIndex);
        };
        ObserverArray.prototype.lastIndexOf = function (searchElement, fromIndex) {
            return this._array.lastIndexOf(searchElement, fromIndex);
        };
        ObserverArray.prototype.every = function (callbackfn, thisArg) {
            return this._array.every(callbackfn, thisArg);
        };
        ObserverArray.prototype.some = function (callbackfn, thisArg) {
            return this._array.some(callbackfn, thisArg);
        };
        ObserverArray.prototype.forEach = function (callbackfn, thisArg) {
            return this._array.forEach(callbackfn, thisArg);
        };
        ObserverArray.prototype.map = function (callbackfn, thisArg) {
            return this._array.map(callbackfn, thisArg);
        };
        ObserverArray.prototype.filter = function (callbackfn, thisArg) {
            return this._array.filter(callbackfn, thisArg);
        };
        ObserverArray.prototype.reduce = function (callbackfn, initialValue) {
            return this._array.reduce(callbackfn, initialValue);
        };
        ObserverArray.prototype.reduceRight = function (callbackfn, initialValue) {
            return this._array.reduceRight(callbackfn, initialValue);
        };
        return ObserverArray;
    }());
    Helpers.ObserverArray = ObserverArray;
    var Observer = (function () {
        function Observer(object, path) {
            this._currentPath = "";
            this._events = new Helpers.LiteEvent();
            this._object = object;
            this._observeObject = this.createObject(this._object, path);
        }
        Observer.prototype.observe = function (handler) {
            this._events.on(handler);
        };
        Observer.prototype.unobserve = function (handler) {
            this._events.off(handler);
        };
        Observer.getPropertyByPath = function (path, object) {
            var pieces = path.split['.'];
            var current = object;
            for (var index = 0; index < pieces.length; index++) {
                var piece = pieces[index];
                current = current[piece];
                if (!current) {
                    break;
                }
            }
            return current;
        };
        Observer.prototype.setProperty = function (path, value) { };
        Observer.prototype.regProperty = function (key, object, observeObject, path, data, alias) {
            var _this = this;
            var propName = alias || key;
            Object.defineProperty(observeObject, propName, {
                get: function () {
                    return data || object[key];
                },
                set: function (value) {
                    var old = object[key];
                    object[key] = value;
                    if (typeof value == 'object') {
                        if (Array.isArray(value)) {
                            var arr = new ObserverArray(object[key], path);
                            arr.observe(function (sender, args) {
                                _this._events.trigger(_this._object, args);
                            });
                            observeObject = arr;
                        }
                        else {
                            data = _this.createObject(object[key], path);
                        }
                    }
                    _this._events.trigger(_this._observeObject, {
                        type: ObserveEventType.Update,
                        path: path,
                        oldValue: old,
                        newValue: value
                    });
                }
            });
            if (alias !== undefined) {
                observeObject[key] = observeObject[alias];
            }
        };
        Observer.prototype.createObject = function (object, path) {
            var _this = this;
            var result = {};
            for (var key in object) {
                var elementPath = (path ? path + "." : "") + key;
                var element = object[key];
                if (typeof element === "object") {
                    var observeObject;
                    if (Array.isArray(element)) {
                        var arr = new ObserverArray(element, elementPath);
                        arr.observe(function (sender, args) {
                            _this._events.trigger(_this._object, args);
                        });
                        observeObject = arr;
                    }
                    else {
                        observeObject = this.createObject(element, elementPath);
                    }
                    this.regProperty(key, object, result, elementPath, observeObject);
                }
                else if (object.hasOwnProperty(key)) {
                    this.regProperty(key, object, result, elementPath);
                }
                else {
                    result[key] = element;
                }
            }
            return result;
        };
        Observer.prototype.getObservable = function () {
            return this._observeObject;
        };
        return Observer;
    }());
    Helpers.Observer = Observer;
})(Helpers || (Helpers = {}));
function getProp(path) {
    var current = this;
    var pices = path.split('.');
    for (var i = 0; i < pices.length; i++) {
        var pice = pices[i];
        current = this[pice];
    }
    return current;
}

var System;
(function (System) {
    var StringFormater = (function () {
        function StringFormater() {
            this._rxMark = /\{(\d+)(?:,([-+]?\d+))?(?:\:([^(^}]+)(?:\(((?:\\\)|[^)])+)\)){0,1}){0,1}\}/g;
        }
        StringFormater.prototype.format = function (string) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            return string.replace(this._rxMark, function (substring, argIndex, length, func, params) {
                var result = data[parseInt(argIndex)];
                return result || "";
            });
        };
        return StringFormater;
    }());
    System.StringFormater = StringFormater;
})(System || (System = {}));
(function (string) {
    var formater = new System.StringFormater();
    string.format = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return formater.format.apply(formater, [this].concat(args));
    };
})(String.prototype);

var System;
(function (System) {
    (function (ThreadState) {
        ThreadState[ThreadState["Aborted"] = 0] = "Aborted";
        ThreadState[ThreadState["Unstarted"] = 1] = "Unstarted";
        ThreadState[ThreadState["Running"] = 2] = "Running";
        ThreadState[ThreadState["Suspended"] = 3] = "Suspended";
        ThreadState[ThreadState["Sleep"] = 4] = "Sleep";
        ThreadState[ThreadState["Stopped"] = 5] = "Stopped";
    })(System.ThreadState || (System.ThreadState = {}));
    var ThreadState = System.ThreadState;
    var Thread = (function () {
        function Thread(handler) {
            this.handler = handler;
            this.state = ThreadState.Unstarted;
        }
        Thread.prototype.start = function (handler) {
            if (handler)
                this.handler = handler;
        };
        Thread.prototype.stop = function () {
            this.state = ThreadState.Stopped;
        };
        Thread.prototype.sleep = function (milliseconds) {
            var start = new Date().getTime();
            while ((new Date().getTime() - start) > milliseconds) { }
        };
        Thread.prototype.abort = function () {
            this.state = ThreadState.Aborted;
        };
        return Thread;
    }());
    System.Thread = Thread;
})(System || (System = {}));

//# sourceMappingURL=app.js.map
