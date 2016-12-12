
export interface IThread {
	start(): IThread;
	stop(): IThread;
	sleep(): IThread;
	state: ThreadState;
}

export enum ThreadState {
	Aborted,
	Unstarted,
	Running,
	Suspended,
	Sleep,
	Stopped
}

export class Thread {
	public id: number;
	public handler: Function;
	public state: ThreadState;

	public start(handler?: Function) {
		if (handler)
			this.handler = handler;

	}

	public stop() {
		this.state = ThreadState.Stopped;
	}

	public sleep(milliseconds) {
		var start = new Date().getTime();
		while ((new Date().getTime() - start) > milliseconds) { }
	}

	public abort() {
		this.state = ThreadState.Aborted;
	}

	constructor(handler?: Function) {
		this.handler = handler;
		this.state = ThreadState.Unstarted;
	}
}