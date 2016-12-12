export interface IEventHandler<TSender, TArgs> {
	(sender: TSender, args: TArgs): void;
	guid?: number; // support proxy
}

export interface IEvent<TSender, TArgs> {
	on(handler: IEventHandler<TSender, TArgs>);
	off(handler: IEventHandler<TSender, TArgs>);
	one(handler: IEventHandler<TSender, TArgs>);
}

export class LiteEvent<TSender, TArgs> implements IEvent<TSender, TArgs> {
	private _handlers: IEventHandler<TSender, TArgs>[] = [];

	public one(handler: IEventHandler<TSender, TArgs>) {
		var oneHendler = (sender: TSender, args: TArgs) => {
			handler(sender, args);
			this.off(oneHendler);
		};
		this.on(oneHendler);
	}

	public on(handler: IEventHandler<TSender, TArgs>) {
		this._handlers.push(handler);
	}

	public off(handler: IEventHandler<TSender, TArgs>) {
		if (!handler.guid) {
			this._handlers = this._handlers.filter(h => h !== handler);
		} else {
			this._handlers = this._handlers.filter(h => h.guid !== handler.guid);
		}
	}

	public clean() {
		this._handlers = [];
	}

	public trigger(sender?: TSender, args?: TArgs) {
		this._handlers.forEach(h => h(sender, args));
	}
}