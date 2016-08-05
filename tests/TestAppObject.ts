/*class A extends System.AppObject {
	public prop = "A";
}

class B extends A {
	public prop = "B";
}

class C {
	public a = new A();
	public b = new B();

	constructor(){
		console.log(this.a.getBase<any>().prop);
		console.log(this.a.prop);
		console.log(this.b.getBase<B>().prop);
		console.log(this.b.prop);
	}
}

var c = new C();*/