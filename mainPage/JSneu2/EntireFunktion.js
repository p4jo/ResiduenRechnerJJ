class EntireFunktion {
    constructor(inner, name = 'f') {
        this.inner = inner;
        this.name = name;
    }
    display() {
        /*mathvariant=\"bold\"*/
        return "\\( " +
            this.name + "\\left(\\mathit{" + Variable.workVariable + "}\\right) =  " + this.inner.display() + "\\)<br>";
    }
    simplified() {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        return new EntireFunktion(this.inner.simplified(), this.name);
    }
    derivative() {
        return new EntireFunktion(this.inner.derivative(), this.name + "'");
    }
}
