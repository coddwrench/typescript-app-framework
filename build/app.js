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
    var Thread = (function () {
        function Thread() {
        }
        Thread.prototype.start = function () {
        };
        Thread.prototype.stop = function () {
        };
        return Thread;
    }());
    System.Thread = Thread;
})(System || (System = {}));

//# sourceMappingURL=app.js.map
