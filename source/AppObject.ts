export class AppObject {
	private _base: any;

	public getBaseType() {
		return this._base;
	}

	public getType() {
		return this.constructor;
	}

	public extends(object: AppObject | any, replace?: boolean) {
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
	}

	public clone<T>() {
		var obj = <AppObject>(new (<any>this["constructor"]));
		return <T><any>obj.extends(this, true);
	}

	public getBase<T>(): T {
		if (this._base) {
			var base = new this._base();
			for (var key in base) {
				//ToDo: Use Accessors.ts
				var getter = base.__lookupGetter__(key)
				if (base.hasOwnProperty(key) || getter)
					base[key] = this[key];
			}
			return base;
		} else
			return undefined;
	}

	constructor() {
		var base = arguments.callee;
		while (base.caller != null && this.getType() != base.caller) {
			base = base.caller;
		}
		this._base = base;
	}
}


