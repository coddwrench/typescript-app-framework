
export interface IDescriptor {
	get: Function;
	set: Function;
}

export class Accessor {
	public isSupportAccessor: boolean;
	private _isStandart: boolean;
	private _isNonStandard: boolean;
	private _object: Object;

	public lookup(key) {

	}

	public define(key, descriptor) {

	}

	constructor(obj) {
		this._object = obj;
	}
}