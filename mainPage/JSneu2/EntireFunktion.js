var EntireFunktion = /** @class */ (function () {
    function EntireFunktion(inner, name) {
        if (name === void 0) { name = 'f'; }
        this.inner = inner;
        this.name = name;
    }
    EntireFunktion.prototype.ausgeben = function () {
        /*mathvariant=\"bold\"*/
        dump(this);
        return "\\( " +
            this.name + "\\left(\\mathit{" + Variable.workVariable + "}\\right) =  " + this.inner.ausgeben() + "\\)<br>";
    };
    EntireFunktion.prototype.simplified = function () {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        return new EntireFunktion(this.inner.simplified(), this.name);
    };
    EntireFunktion.prototype.derivative = function () {
        return new EntireFunktion(this.inner.derivative(), this.name + "'");
    };
    return EntireFunktion;
}());
