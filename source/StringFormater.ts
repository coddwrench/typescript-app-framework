namespace System {

	//ToDo: add support format functions
	interface IFormatter {
		getFormat(): any;
	}

	/**
	 * StringFormater
	 */
	export class StringFormater {
		private _rxMark = /\{(\d+)(?:,([-+]?\d+))?(?:\:([^(^}]+)(?:\(((?:\\\)|[^)])+)\)){0,1}){0,1}\}/g;

		public format(string: String, ...data: any[]) {
			return string.replace(this._rxMark, (substring: string, argIndex: string, length, func, params) => {
				var result: string = data[parseInt(argIndex)];
				return result || "";
			})
		}
	}
}

/*(function (string) {
	var formater = new System.StringFormater();
	string.format = function (...args: any[]) {
		return formater.format(this, ...args);
	}
})(String.prototype)

// difine format function
interface String {
	format(...arg: String[]): string;
}*/
