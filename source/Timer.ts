import { LiteEvent, IEventHandler } from "./LiteEvent";

export enum TimeoutState {
	Running,
	Stopped
}


export class Timer {
	private _id: number;

	private _tickEvent = new LiteEvent<Timer, void>();

	private _interval: number;

	public onTick(handler: IEventHandler<Timer, void>) {
		this._tickEvent.on(handler);
		return this;
	}

	public offTick(handler: IEventHandler<Timer, void>) {
		this._tickEvent.off(handler);
		return this;

	}

	public oneTick(handler: IEventHandler<Timer, void>) {
		this._tickEvent.one(handler);
		return this;

	}

	public start() {
		this._id = setInterval(() => {
			this._tickEvent.trigger(this);
		}, this._interval);
		return this;
	}

	public restart() {
		this
			.stop()
			.start();
	}

	public stop() {
		if (this._id) {
			setInterval(this._id);
			delete this._id;
		}
		return this;
	}
}