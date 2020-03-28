
class EntireFunktion {
    readonly inner: FunktionElement;
    input: FunktionElement;
    name: string;

    constructor(inner: FunktionElement, name: string = 'f', input: FunktionElement = null) {
        this.inner = inner;
        this.name = name;
        this.input = input ?? Variable.ofName(workVariable);
    }


    display(): string {
        return "\\( \\operatorname{" + this.name + "}\\left(" + this.input.display() + "\\right) =  " + this.inner.display() + "\\)";
    }

    simplified(): EntireFunktion {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        return new EntireFunktion(this.inner.simplified(), this.name, this.input.simplified());
    }

    derivative(): EntireFunktion {
        return new EntireFunktion(this.inner.derivative(), this.name + "'", this.input);
    }


    valueAt(x: FunktionElement): EntireFunktion {
        let wV = Variable.ofName(workVariable);

        let useinner = wV.useinner;
        let inner = wV.inner;

        wV.useinner = true;
        wV.inner = x;

        let result = new EntireFunktion(this.inner.simplified(), this.name, x);

        wV.useinner = useinner;
        wV.inner = inner;

        return result;
    }
}