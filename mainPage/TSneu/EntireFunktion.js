class EntireFunktion {
    constructor(inner, name = 'f') {
        this.inner = inner;
        this.name = name;
    }
    display() {
        let wV = Variable.ofName(Variable.workVariable);
        return "\\( " +
            this.name + "\\left(" + wV.display() + "\\right) =  " + this.inner.display() + "\\)<br>";
    }
    simplified() {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        return new EntireFunktion(this.inner.simplified(), this.name);
    }
    derivative() {
        return new EntireFunktion(this.inner.derivative(), this.name + "'");
    }
    valueAt(x) {
        let wVName = Variable.workVariable;
        Variable.workVariable = '';
        let wV = Variable.ofName(wVName);
        wV.useinner = true;
        wV.inner = x;
        let result = new EntireFunktion(this.inner.simplified(), this.name);
        return result;
    }
}
