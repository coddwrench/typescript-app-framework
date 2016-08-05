module Helpers {
	export interface IEventHandler<TSender, TArgs> { (sender: TSender, args: TArgs): void; }
	export interface IEvent<TSender, TArgs> {
		on(handler: IEventHandler<TSender, TArgs>);
		off(handler: IEventHandler<TSender, TArgs>);
	}

	export class LiteEvent<TSender, TArgs> implements IEvent<TSender, TArgs> {
		private _handlers: IEventHandler<TSender, TArgs>[] = [];

		public on(handler: IEventHandler<TSender, TArgs>) {
			this._handlers.push(handler);
		}

		public off(handler: IEventHandler<TSender, TArgs>) {
			this._handlers = this._handlers.filter(h => h !== handler);
		}

		public clean() {
			this._handlers = [];
		}

		public trigger(sender?: TSender, args?: TArgs) {
			this._handlers.forEach(h => h(sender, args));
		}
	}
}


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
	}

	export class ObserverArray<T> implements Array<T> {
		private _array = new Array<T>();
		private _events = new LiteEvent<Array<T>, IObserverEventArgs>();
		private _currentPath = "";

		public observe(handler: IEventHandler<Array<T>, IObserverEventArgs>) {
			this._events.on(handler);
		}

		public unobserve(handler: IEventHandler<Array<T>, IObserverEventArgs>) {
			this._events.off(handler);
		}

		private initArray() {
			for (var index = 0; index < this._array.length; index++) {
				this.regProperty(index, this._currentPath);
			}
		}

		private regProperty(index, path) {

			var data;
			if (typeof this._array[index] === "object") {
				var observe = new Observer(this._array[index], path);
				observe.observe((obj, args) => {
					this._events.trigger(this._array, args);
				});
				data = observe.getObservable();
			}

			Object.defineProperty(this, index, {
				configurable: true,
				enumerable: true,
				get: () => {
					return data || this._array[index];
				},
				set: (value) => {
					var old = this._array[index];
					this._events.trigger(this._array, {
						type: ObserveEventType.Update,
						path: path,
						oldValue: old,
						newValue: value
					});
					if (typeof value !== "object") {
						this._array[index] = value;
					} else {
						this._array[index] = value;
						var observe = new Observer(this._array[index], path);
						observe.observe((obj, args) => {
							this._events.trigger(this._array, args);
						});
						data = observe.getObservable();
					}
				}
			});
		}

		private removeProperty(index) {
			delete this[index];
		}

		public get length() {
			return this._array.length;
		}

		public set length(value) {
			this._array.length = value;
		}

		public push(...items: T[]) {
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
		}

		public shift() {
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
		}

		public unshift(...items: T[]) {
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
		}

		public splice(start: number, deleteCount?: number, ...items: T[]): T[] {
			var values = this._array.splice(start, deleteCount, ...items);
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
		}

		public pop() {
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
		}

		public join(separator?: string): string {
			return this._array.join(separator)
		}

		public reverse() {
			return this._array.reverse();
		}

		public concat(...items: T[]) {
			return this._array.concat(...items)
		}

		public slice(start?: number, end?: number) {
			return this._array.slice(start, end);
		}

		public sort(compareFn?: (a: T, b: T) => number) {
			this._array.sort(compareFn);
			this.initArray();
			return this;
		}

		public indexOf(searchElement: T, fromIndex?: number) {
			return this._array.indexOf(searchElement, fromIndex);
		}

		public lastIndexOf(searchElement: T, fromIndex?: number): number {
			return this._array.lastIndexOf(searchElement, fromIndex);
		}

		public every(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any) {
			return this._array.every(callbackfn, thisArg);
		}

		public some(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any) {
			return this._array.some(callbackfn, thisArg);
		}
		public forEach(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any) {
			return this._array.forEach(callbackfn, thisArg);
		}

		public map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any) {
			return this._array.map(callbackfn, thisArg);
		}

		public filter(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[] {
			return this._array.filter(callbackfn, thisArg);
		}

		public reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U) {
			return this._array.reduce(callbackfn, initialValue);
		}

		public reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U) {
			return this._array.reduceRight(callbackfn, initialValue);
		}

		[n: number]: T;
		constructor(array: Array<T>, path?: string) {
			this._array = array;
			this.initArray()
			this._currentPath = path || "";
		}
	}

	export class Observer<T> {
		private _object: T;
		private _observeObject: T;
		private _currentPath = "";

		private _events = new LiteEvent<T, IObserverEventArgs>();
		public observe(handler: IEventHandler<T, IObserverEventArgs>) {
			this._events.on(handler);
		}

		public unobserve(handler: IEventHandler<T, IObserverEventArgs>) {
			this._events.off(handler);
		}

		public static getPropertyByPath(path: string, object: any) {
			let pieces = path.split['.'];
			let current = object;
			for (var index = 0; index < pieces.length; index++) {
				var piece = pieces[index];
				current = current[piece];
				if (!current) {
					break;
				}
			}
			return current;
		}

		public setProperty(path: string, value: any) { }

		private regProperty(key, object, observeObject, path?: string, data?, alias?: string) {
			var propName = alias || key;
			Object.defineProperty(observeObject, propName, {
				get: () => {
					return data || object[key];
				},
				set: (value) => {
					var old = object[key];
					object[key] = value;
					if (typeof value == 'object') {
						if (Array.isArray(value)) {
							var arr = new ObserverArray(object[key], path);
							arr.observe((sender, args) => {
								this._events.trigger(this._object, args);
							});
							observeObject = arr;
						} else {
							data = this.createObject(object[key], path);
						}
					}
					this._events.trigger(this._observeObject, {
						type: ObserveEventType.Update,
						path: path,
						oldValue: old,
						newValue: value
					});
				}
			});
			if (alias !== undefined) {
				observeObject[key] = observeObject[alias]
			}
		}

		private createObject(object: Object, path?: string) {
			var result = {};
			for (var key in object) {
				var elementPath = (path ? path + "." : "") + key;
				var element = object[key];
				if (typeof element === "object") {
					var observeObject;
					if (Array.isArray(element)) {
						var arr = new ObserverArray(element, elementPath);
						arr.observe((sender, args) => {
							this._events.trigger(this._object, args);
						});
						observeObject = arr;
					} else {
						observeObject = this.createObject(element, elementPath);
					}
					this.regProperty(key, object, result, elementPath, observeObject);
				} else if (object.hasOwnProperty(key)) {
					this.regProperty(key, object, result, elementPath);
				} else {
					result[key] = element;
				}
			}
			return result;
		}

		//Возвращает объект 
		public getObservable() {
			return this._observeObject;
		}

		constructor(object: T, path?: string) {
			this._object = object;
			this._observeObject = <T>this.createObject(this._object, path);
		}
	}
}

function getProp(path: string) {
	var current = this;
	var pices = path.split('.');
	for (var i = 0; i < pices.length; i++) {
		var pice = pices[i];
		current = this[pice];
	}
	return current;
}