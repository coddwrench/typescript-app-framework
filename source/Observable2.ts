/// <reference path="LiteEvent.ts"/>

module Helpers {

	export enum ObserveEventType {
		Update,
		Add,
		Remove
	}

	export interface IObserverEventArgs {
		type: ObserveEventType;
		path: string;
		oldValue?: any;
		newValue?: any;
		index?: number;
		oldLength?: number;
	}

	export interface IObserver<T> {
		isObserver: boolean;
		observe(handler: IEventHandler<T, IObserverEventArgs>): IObserver<T>;
		unobserve(handler: IEventHandler<T, IObserverEventArgs>): IObserver<T>;
	}

	export var setPropertyMethod = function (object, key, value) {

		object[key] = value;
	};

	function getObserve(object: any, elementPath?: string): IObserver<any> {
		var result = null;
		if (object["isObserver"]) {
			result = object as any;
		} else {
			if (typeof object === "object" && Array.isArray(object)) {
				// если это массив
				result = new ObserverArray<any>(object, elementPath);
			} else if (typeof object === "object") {
				// если это просто объект
				result = new ObserverObject<any>(object, elementPath);
			}
		}
		return result;
	}

	function regProperty(key, object, observeObject, path?: string, data?) {
		Object.defineProperty(observeObject, key, {
			get: () => {
				return data || object[key];
			},
			set: (value) => {
				var old = object[key];
				object[key] = value;
				data = getObserve(value, path);
				this._events.trigger(this as any, {
					type: ObserveEventType.Update,
					path: path,
					oldValue: old,
					newValue: value
				});
			}
		});
	}

	class ObserverArray<T> extends Array<T> implements IObserver<T>{
		public isObserver = true;
		private _currentPath = "";
		private _events = new LiteEvent<T, IObserverEventArgs>();
		private _object = {};
		private _array;
		public observe(handler: IEventHandler<T, IObserverEventArgs>) {
			this._events.on(handler);
			return this;
		}

		public unobserve(handler: IEventHandler<T, IObserverEventArgs>) {
			this._events.off(handler);
			return this;
		}

		public push(...items: T[]) {
			var oldLength = this.length;
			for (var i = 0; i < items.length; i++) {
				var path = this._currentPath + "[" + index + "]";
				var index = oldLength++;
				regProperty(index, this, this._object, path);
				this[index] = this._object[index];
			}
			return this.length;
		}

		constructor(object: T, path?: string) {
			super();
			this._array = object;
		}
	}

	class ObserverObject<T> implements IObserver<T>{
		public isObserver = true;
		private _object = {};
		private _events = new LiteEvent<T, IObserverEventArgs>();

		public observe(handler: IEventHandler<T, IObserverEventArgs>) {
			this._events.on(handler);
			return this;
		}

		public unobserve(handler: IEventHandler<T, IObserverEventArgs>) {
			this._events.off(handler);
			return this;
		}

		private _change = (sender, args) => {
			this._events.trigger(sender, args);
		}

		private regProperty(key, object, observeObject, path?: string, data?) {
			Object.defineProperty(observeObject, key, {
				get: () => {
					return data || object[key];
				},
				set: (value) => {
					var old = object[key];
					object[key] = value;
					data = getObserve(value, path);
					if (data)
						data.observe(this._change);
					this._events.trigger(this as any, {
						type: ObserveEventType.Update,
						path: path,
						oldValue: old,
						newValue: value
					});
				}
			});
		}

		private init(object: T, path?: string) {
			for (var key in object) {
				var elementPath = (path ? path + "." : "") + key;
				var element = object[key];
				if (object.hasOwnProperty(key)) {
					var observe = getObserve(element, elementPath);
					this.regProperty(key, object, this._object, elementPath, observe || element);
					if (observe) {
						observe.observe(this._change);
						setPropertyMethod(this, key, this._object[key]);
					} else {
						var descriptors = Object.getOwnPropertyDescriptor(this._object, key);
						setPropertyMethod(this, key, observe);
					}

				} else {
					this[key] = element;
				}
			}
		}

		constructor(object: T, path?: string) {
			this.init(object, path);
		}
	}

	export class Observer<T> {
		private _events = new LiteEvent<T, IObserverEventArgs>();
		private _observeObject: IObserver<T>;

		public get object(): T {
			return <any>this._observeObject;
		}

		public observe(handler: IEventHandler<T, IObserverEventArgs>) {
			this._events.on(handler);
			return this;
		}

		private _change = (sender, args) => {
			this._events.trigger(<any>this._observeObject, args);
		}

		public unobserve(handler: IEventHandler<T, IObserverEventArgs>) {
			this._events.off(handler);
			return this;
		}

		public destroy() {
			this._events.clean();
			this._observeObject.unobserve(this._change);
		}

		constructor(object: T) {
			if (object) {
				this._observeObject = getObserve(object);
				this._observeObject.observe(this._change);
			}
		}
	}
}


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

obs.observe((a, b) => {
	console.log(a, b);
});

res.a = 12;


obs2.observe(() => {
	console.log(1111);
});

res.a = 11;

obs2.destroy();

res.a = 110;

res.b = { a: 100, b: 100 };
res.b.b = 200;

