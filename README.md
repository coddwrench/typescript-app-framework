This is alpha version!
=====================
# LiteEvent
import objects
```typescript
import { LiteEvent, IEventHandler } from "./LiteEvent";
```
use
```typescript
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
```