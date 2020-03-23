var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var sqrt = /** @class */ (function (_super) {
    __extends(sqrt, _super);
    function sqrt() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    sqrt.prototype.getValue = function () {
        return this.op.getValue().sqrtN();
    };
    sqrt.prototype.ausgeben = function (outerPrecendence) {
        if (outerPrecendence === void 0) { outerPrecendence = 0; }
        return "\\sqrt{" + this.op.ausgeben() + "}";
    };
    sqrt.prototype.derivative = function () {
        return this.isConstant() ? Numeric.zero : this.op.derivative().divideBy(Numeric.two.multiply(this));
    };
    sqrt.prototype.simplified = function () {
        if (this.isNumeric())
            return this.getValue();
        var simplerop = this.op.simplified();
        if (simplerop instanceof Potenz) {
            //TODO stimmt im komplexen nicht immer
            simplerop.op2 = simplerop.op2.divideBy(Numeric.two);
            return simplerop;
        }
        return new sqrt(simplerop);
    };
    sqrt.prototype.isNumeric = function () {
        if (!this.op.isNumeric())
            return false;
        //TODO: wann nicht vereinfachen für Mathematische Exaktheit
        //result += this.inlineAusgeben() + "=".this.getValue().inlineAusgeben();
        if (this.getValue().isRational() || !this.op.getValue().isRational())
            return true;
        return false;
    };
    return sqrt;
}(UnaryOperation));
var cos = /** @class */ (function (_super) {
    __extends(cos, _super);
    function cos() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    cos.prototype.derivative = function () {
        return this.isConstant() ? Numeric.zero : (Numeric.ofF(-1)).multiply(new sin(this.op)).multiply(this.op.derivative());
    };
    cos.prototype.getValue = function () {
        var v = this.op.getValue();
        return Numeric.ofF(Math.cos(v.reF()) * Math.cosh(v.imF()), -Math.sin(v.reF()) * Math.sinh(v.imF()));
    };
    cos.prototype.simplified = function () {
        var simpler = new sqrt(this.op.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        // TODO: Implement simplify() method.
        return simpler;
    };
    return cos;
}(UnaryOperation));
var sin = /** @class */ (function (_super) {
    __extends(sin, _super);
    function sin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    sin.prototype.derivative = function () {
        return this.isConstant() ? Numeric.zero : (new cos(this.op)).multiply(this.op.derivative());
    };
    sin.prototype.getValue = function () {
        var v = this.op.getValue();
        return Numeric.ofF(Math.sin(v.reF()) * Math.cosh(v.imF()), Math.cos(v.reF()) * Math.sinh(v.imF()));
    };
    sin.prototype.simplified = function () {
        var simpler = new sqrt(this.op.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        // TODO: Implement simplify() method.
        return simpler;
    };
    return sin;
}(UnaryOperation));
var ln = /** @class */ (function (_super) {
    __extends(ln, _super);
    function ln() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ln.prototype.derivative = function () {
        return this.isConstant() ? Numeric.zero : this.op.derivative().divideBy(this.op);
    };
    ln.prototype.getValue = function () {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrigen Logarithmus einführen
        return Numeric.ofF(Math.log(this.op.getValue().absSquaredF()) / 2, this.op.getValue().argF());
    };
    ln.prototype.simplified = function () {
        var simpler = new sqrt(this.op.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        // TODO: Implement simplify() method.
        return simpler;
    };
    return ln;
}(UnaryOperation));
