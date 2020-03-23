var EntireFunktion = /** @class */ (function () {
    function EntireFunktion(root, name) {
        if (name === void 0) { name = 'f'; }
        this.root = root;
        this.name = name;
    }
    EntireFunktion.prototype.ausgeben = function () {
        /*mathvariant=\"bold\"*/
        return "\\( " +
            this.name + "\\left(\\mathit{" + Variable.workVariable + "}\\right) =  " + this.root.ausgeben() + "\\)<br>";
    };
    EntireFunktion.prototype.simplified = function () {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        return new EntireFunktion(this.root.simplified(), this.name);
    };
    EntireFunktion.prototype.derivative = function () {
        return new EntireFunktion(this.root.derivative(), this.name + "'");
    };
    return EntireFunktion;
}());
