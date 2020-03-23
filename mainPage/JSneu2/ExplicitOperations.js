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
var AdditionType = /** @class */ (function (_super) {
    __extends(AdditionType, _super);
    function AdditionType(op1, op2) {
        return _super.call(this, op1 !== null && op1 !== void 0 ? op1 : Numeric.zero, op2 !== null && op2 !== void 0 ? op2 : Numeric.zero) || this;
    }
    AdditionType.prototype.precedence = function () {
        return 2;
    };
    //Mit Multiplizität
    AdditionType.prototype.allSummands = function () {
        var _a;
        var numeric = Numeric.zero;
        var list;
        if (this.op1.isNumeric())
            numeric = this.op1.getValue();
        else if (this.op1 instanceof AdditionType)
            _a = this.op1.allSummands(), numeric = _a[0], list = _a[1];
        else if (this.op1 instanceof MultiplicationType) {
            var factors = this.op1.allFactors();
            //TODO Rest
            list.push(this.op1);
        }
        //else
        //  output{this.op1, Numeric.one};
        if (this.op2.isNumeric()) {
            if (this instanceof Addition)
                numeric = numeric.addN(this.op2.getValue());
            else
                numeric = numeric.subtractN(this.op2.getValue());
        }
        else if (this.op2 instanceof AdditionType) {
            if (this instanceof Addition)
                numeric = numeric.addN(this.op2.getValue());
            else
                numeric = numeric.subtractN(this.op2.getValue());
            list = list.concat(this.op2.allSummands()[1]);
        }
        else
            list.push(this.op2);
        return [numeric, list];
    };
    //Soll allSummands benutzen
    AdditionType.prototype.simplify = function () {
        //0 kann weg
        if (this.op1.isZero()) {
            if (this instanceof Addition)
                return this.op2;
            return this;
        }
        if (this.op2.isZero()) {
            return this.op1;
        }
        /*  TODO
                //Fall 1
                if(this.op2 instanceof AdditionType && this.op1.isNumeric()) {
                    let result = null;
                    let simplerop2 = this.op2.extractNumeric(result);
                    if (result instanceof Numeric && !result.isZero()) {
                        return this instanceof Addition ?
                            //TODO korrigieren, vielleicht wieder aufspalten auf Untertypen
                            this.op1.getValue() . addN (result) . add (simplerop2) :
                            this.op1.getValue() . subtractN (result) . add (simplerop2);
                    }
                }
        
                //Fall 2
                if(this.op1 instanceof AdditionType && this.op2 . isNumeric()) {
                    let result = null;
                    let simplerop1 = this.op1.extractNumeric(result);
                    if (result instanceof Numeric && !result.isZero()) {
                        return this instanceof Addition ?
                            this.op2.getValue() . addN (result) . add (simplerop1) :
                            this.op2.getValue() . subtractN (result) . add (simplerop1);
                    }
                }
        */
        return this;
    };
    return AdditionType;
}(BinaryOperation));
var Addition = /** @class */ (function (_super) {
    __extends(Addition, _super);
    function Addition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Addition.prototype.normalInlineAusgeben = function (left, right) {
        return left + " + " + right;
    };
    Addition.prototype.derivative = function () {
        return this.isConstant() ? Numeric.zero : this.op1.derivative().add(this.op2.derivative());
    };
    Addition.prototype.getValue = function () {
        return this.op1.getValue().addN(this.op2.getValue());
    };
    Addition.prototype.simplified = function () {
        // Todo So sollte jedes Simplified beginnen
        var simpler = new Addition(this.op1.simplified(), this.op2.simplified());
        if (simpler.isNumeric()) {
            return simpler.getValue();
        }
        //ENDE so
        return simpler.simplify();
    };
    return Addition;
}(AdditionType));
var Subtraction = /** @class */ (function (_super) {
    __extends(Subtraction, _super);
    function Subtraction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Subtraction.prototype.normalInlineAusgeben = function (left, right) {
        return left + '-' + right;
    };
    Subtraction.prototype.derivative = function () {
        return this.isConstant() ? Numeric.zero : this.op1.derivative().subtract(this.op2.derivative());
    };
    Subtraction.prototype.getValue = function () {
        return this.op1.getValue().subtractN(this.op2.getValue());
    };
    Subtraction.prototype.simplified = function () {
        // Todo So sollte jedes Simplified beginnen
        var simpler = new Subtraction(this.op1.simplified(), this.op2.simplified());
        if (simpler.isNumeric()) {
            return simpler.getValue();
        }
        //ENDE so
        if (simpler.op1.equals(simpler.op2))
            return Numeric.zero;
        return simpler.simplify();
    };
    return Subtraction;
}(AdditionType));
var MultiplicationType = /** @class */ (function (_super) {
    __extends(MultiplicationType, _super);
    function MultiplicationType(op1, op2) {
        return _super.call(this, op1 !== null && op1 !== void 0 ? op1 : Numeric.one, op2 !== null && op2 !== void 0 ? op2 : Numeric.one) || this;
    }
    MultiplicationType.prototype.allFactors = function () {
        //TODO
        return null;
    };
    return MultiplicationType;
}(BinaryOperation));
var Multiplikation = /** @class */ (function (_super) {
    __extends(Multiplikation, _super);
    function Multiplikation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Multiplikation.prototype.normalAusgeben = function (left, right) {
        return left + '\\cdot ' + right;
    };
    Multiplikation.prototype.normalInlineAusgeben = function (left, right) {
        return left + '·' + right;
    };
    Multiplikation.prototype.derivative = function () {
        return this.isConstant() ? Numeric.zero :
            this.op1.derivative().multiply(this.op2).add(this.op1.multiply(this.op2.derivative()));
    };
    Multiplikation.prototype.simplified = function () {
        var simpler = new Multiplikation(this.op1.simplified(), this.op2.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        if (simpler.op1.isNumeric() && simpler.op1.isZero()) {
            return Numeric.zero;
        }
        if (simpler.op1.isNumeric() && simpler.op1.isOne()) {
            return simpler.op2;
        }
        if (simpler.op2.isNumeric() && simpler.op2.isZero()) {
            return Numeric.zero;
        }
        if (simpler.op2.isNumeric() && simpler.op2.isOne()) {
            return simpler.op1;
        }
        //result += "Nichts vereinfacht (multiplikation) <math>" . simpler.ausgeben() . "</math><br>";
        //TODO
        return simpler;
    };
    Multiplikation.prototype.getValue = function () {
        return this.op1.getValue().multiplyN(this.op2.getValue());
    };
    return Multiplikation;
}(MultiplicationType));
var Division = /** @class */ (function (_super) {
    __extends(Division, _super);
    function Division(op1, op2) {
        var _this = _super.call(this, op1, op2) || this;
        if (_this.op2.isZero()) {
            HTMLoutput += "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
            HTMLoutput += "ich habe das jetzt mal zu einer 1 geändert...<br>";
            _this.op2 = Numeric.one;
        }
        return _this;
    }
    //Nur wegen Ausnahme bei Bruchstrich + Keine Klammern
    Division.prototype.ausgeben = function (outerPrecedence) {
        if (outerPrecedence === void 0) { outerPrecedence = 0; }
        if (outerPrecedence > this.precedence())
            return "\\left(" + this.normalAusgeben(this.op1.ausgeben(), this.op2.ausgeben()) + "\\right)";
        return this.normalAusgeben(this.op1.ausgeben(), this.op2.ausgeben());
    };
    Division.prototype.normalAusgeben = function (left, right) {
        return RationalReal.fractionAusgeben(left, right);
    };
    Division.prototype.normalInlineAusgeben = function (left, right) {
        return left + " ÷ " + right;
    };
    Division.prototype.derivative = function () {
        return this.isConstant() ? Numeric.zero : new Division(new Subtraction(new Multiplikation(this.op1.derivative(), this.op2), new Multiplikation(this.op1, this.op2.derivative())), new Potenz(this.op2, Numeric.ofF(2)));
    };
    Division.prototype.simplified = function () {
        var simpler = new Division(this.op1.simplified(), this.op2.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        if (simpler.op1.equals(simpler.op2))
            return Numeric.one;
        return simpler;
    };
    Division.prototype.getValue = function () {
        return this.op1.getValue().divideByN(this.op2.getValue());
    };
    return Division;
}(MultiplicationType));
var Potenz = /** @class */ (function (_super) {
    __extends(Potenz, _super);
    function Potenz() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Potenz.prototype.precedence = function () { return 4; };
    //Nur wegen Ausnahme bei Hochstellung + Keine Klammer
    Potenz.prototype.ausgeben = function (outerPrecedence) {
        if (outerPrecedence === void 0) { outerPrecedence = 0; }
        var innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "\\left(" + this.normalAusgeben(this.op1.ausgeben(innerPrec), this.op2.ausgeben()) + "\\right)";
        return this.normalAusgeben(this.op1.ausgeben(innerPrec), this.op2.ausgeben());
    };
    Potenz.prototype.normalAusgeben = function (left, right) {
        return left + "^{" + right + "}";
    };
    Potenz.prototype.normalInlineAusgeben = function (left, right) {
        return left + "^(" + right + ")";
    };
    Potenz.prototype.derivative = function () {
        if (this.isConstant())
            return Numeric.zero;
        if (this.op2.isConstant()) {
            return this.op2.multiply(this.op1.toPower(this.op2.subtract(Numeric.one))).multiply(this.op1.derivative());
        }
        else if (this.op1.equals(Variable.ofName('e'))) {
            return this.op2.derivative().multiply(this);
        }
        else if (this.op1.isConstant()) {
            return this.op2.derivative().multiply(new ln(this.op1)).multiply(this);
        }
        else {
            return this.multiply((new ln(this.op1)).multiply(this.op2.derivative()).add(this.op1.derivative().divideBy(this.op1).multiply(this.op2)));
        }
    };
    Potenz.prototype.simplified = function () {
        var simpler = new Potenz(this.op1.simplified(), this.op2.simplified());
        if (simpler.isNumeric()) {
            return simpler.getValue();
        }
        if (simpler.op2.isZero())
            return Numeric.one;
        if (simpler.op1.isZero())
            return Numeric.zero;
        if (simpler.op1.isOne())
            return Numeric.one;
        if (simpler.op2.isOne())
            return simpler.op1;
        return simpler;
    };
    Potenz.prototype.getValue = function () {
        return this.op1.getValue().toPowerN(this.op2.getValue());
    };
    return Potenz;
}(BinaryOperation));
