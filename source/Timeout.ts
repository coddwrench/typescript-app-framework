import { LiteEvent, IEventHandler } from "./LiteEvent";

export enum TimeoutState {
	Running,
	Stopped
}

export class Timeout {

	private _id: number;

	private _fireEvent = new LiteEvent<Timeout, void>();

	private _delay = 0;

	public state: TimeoutState;
	public onFire(handler: IEventHandler<Timeout, void>) {
		this._fireEvent.on(handler);
		return this;
	}

	public offFire(handler: IEventHandler<Timeout, void>) {
		this._fireEvent.off(handler);
		return this;
	}

	public oneFire(handler: IEventHandler<Timeout, void>) {
		this._fireEvent.one(handler);
		return this;

	}

	public start() {
		this.state = TimeoutState.Running;
		this._id = setTimeout(() => {
			this._fireEvent.trigger(this);
		}, this._delay);
		return this;
	}

	public stop() {
		this.state = TimeoutState.Stopped;
		if (this._id) {
			clearTimeout(this._id);
			delete this._id;
		}
		return this;
	}

	public constructor(delay: number) {
		this._delay = delay;
		this.state = TimeoutState.Stopped;
	}
}


interface IMyClassFireEventArgs {
	count: number;
}

class MyCounter {

	private _count = 0;
	private _fireEvent = new LiteEvent<MyCounter, IMyClassFireEventArgs>();

	public onIncrement(handler: IEventHandler<MyCounter, IMyClassFireEventArgs>) {
		this._fireEvent.on(handler);
		return this;
	}

	public offIncrement(handler: IEventHandler<MyCounter, IMyClassFireEventArgs>) {
		this._fireEvent.off(handler);
		return this;
	}

	public increment() {
		this._count++;
		this._fireEvent.trigger(this, {
			count: this._count
		});
		return this;
	}
}

var myCounter = new MyCounter();
myCounter
	.onIncrement((counter, args) => {
		console.log("first " + args.count);
	}).onIncrement((counter, args) => {
		console.log("next " + args.count);
	});

myCounter.increment();