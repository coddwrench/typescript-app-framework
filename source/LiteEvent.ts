module Helpers {
	export interface IEventHandler<TSender, TArgs> { (sender: TSender, args: TArgs): void; }
	export interface IEvent<TSender, TArgs> {
		on(handler: IEventHandler<TSender, TArgs>);
		off(handler: IEventHandler<TSender, TArgs>);
	}

	export class LiteEvent<TSender, TArgs> implements IEvent<TSender, TArgs> {
		private _handlers: IEventHandler<TSender, TArgs>[] = [];

		// Событие выполняется только один раз
		public one(handler: IEventHandler<TSender, TArgs>) {
			var oneHendler = (sender: TSender, args: TArgs) => {
				handler(sender, args);
				this.off(oneHendler);
			};
			this.on(handler);
		}

		// Подписываемся на событие
		public on(handler: IEventHandler<TSender, TArgs>) {
			this._handlers.push(handler);
		}

		// Отписываемся от события
		public off(handler: IEventHandler<TSender, TArgs>) {
			this._handlers = this._handlers.filter(h => h !== handler);
		}

		// Отписаться от всех событий
		public clean() {
			this._handlers = [];
		}

		// Вызов события
		public trigger(sender?: TSender, args?: TArgs) {
			this._handlers.forEach(h => h(sender, args));
		}
	}
}
