//GLOBAL CONSTANTS
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
var floatToRationalTolerance = 1e-10;
var floatToRationalMaxDen = 100000;
var registeredVariables;
// TODO: Auch Operationen müssen, wie Variablen, nur zu Numerics vereinfacht werden dürfen, wenn das gewünscht ist
// (z.B. Additionen immer erlaubt (oder bei rational plus number nicht), aber Wurzel und ln nicht erlaubt, weil das in Zahlen in mathematischer Notation auch stehen bleibt
// Enter any new Operator here. By default Operators are left-grouping within their precedence class, add key
// 'rightAssociative' if meant otherwise
var operations = {
    '+': { 'name': 'Addition', 'arity': 2, 'precedence': 2 },
    '-': { 'name': 'Subtraktion', 'arity': 2, 'precedence': 2 },
    '/': { 'name': 'Division', 'arity': 2, 'precedence': 4 },
    '÷': { 'name': 'Division', 'arity': 2, 'precedence': 3 },
    ':': { 'name': 'Division', 'arity': 2, 'precedence': 3 },
    '*': { 'name': 'Multiplikation', 'arity': 2, 'precedence': 3 },
    '×': { 'name': 'Multiplikation', 'arity': 2, 'precedence': 3 },
    '·': { 'name': 'Multiplikation', 'arity': 2, 'precedence': 3 },
    //    '%' : {'name' : 'RestMod', 'arity' : 2, 'precedence' : 3},
    '^': { 'name': 'Potenz', 'arity': 2, 'precedence': 4, 'rightAssociative': 1 },
    'sin': { 'name': 'sin', 'arity': 1, 'precedence': 5 },
    'cos': { 'name': 'cos', 'arity': 1, 'precedence': 5 },
    'ln': { 'name': 'ln', 'arity': 1, 'precedence': 5 },
    'sqrt': { 'name': 'sqrt', 'arity': 1, 'precedence': 5 },
    'Wurzel': { 'name': 'sqrt', 'arity': 1, 'precedence': 5 },
    'ζ': { 'name': 'RiemannZeta', 'arity': 1, 'precedence': 5 },
    //Pi-Funktion (entschobene Gamma-Funktion) //postfix
    '!': { 'name': 'Factorial', 'arity': 1, 'precedence': 5 }
};
/**
 * Class FunktionElement: IMMUTABLE
 */
var FunktionElement = /** @class */ (function () {
    function FunktionElement() {
    }
    FunktionElement.prototype.isOne = function () {
        return false;
    };
    FunktionElement.prototype.isZero = function () {
        return false;
    };
    FunktionElement.prototype.equals = function (other) {
        if (this.isNumeric() != other.isNumeric() || this.isConstant() != other.isConstant())
            return false;
        if (this.isNumeric() && other.isNumeric())
            return other.getValue().equalsN(this.getValue());
        return null;
    };
    //ENDE ABSTRAKTE FUNKTIONEN
    FunktionElement.prototype.add = function (other) {
        return new Addition(this, other);
    };
    FunktionElement.prototype.subtract = function (other) {
        return new Subtraction(this, other);
    };
    FunktionElement.prototype.multiply = function (other) {
        return new Multiplikation(this, other);
    };
    FunktionElement.prototype.divideBy = function (other) {
        return new Division(this, other);
    };
    FunktionElement.prototype.toPower = function (other) {
        return new Potenz(this, other);
    };
    FunktionElement.prototype.sqrt = function () {
        return new sqrt(this);
    };
    return FunktionElement;
}());
/**
 * Alle Funktionen sollten als Unterklassen von den Operation - Klassen definiert werden,
 * sie können simplify und müssen ableiten überschreiben, statische Funktionen sollten nicht
 * und ausgeben muss nicht überschrieben werden.
 * Jeder Operator und jede Funktion muss in operations eingetragen werden.
 */ /*
abstract class Operation extends FunktionElement {

   protected array op;

   constructor(op : FunktionElement []) {
       this.op = op;
   }

   isNumeric() : boolean {
       result = true;
       foreach (this.op as o)
       {
           result = result && o + isNumeric();
       }
       return result;
   }

   isConstant() : boolean {
       result = true;
       foreach (this.op as o)
       {
           result = result && o + isConstant();
       }
       return result;
   }

   ausgeben(outerPrecendence : number = 0) : string    {
       return "\\mathrm{" + this.constructor.toString() + "}\\left(" .
           implode(", ", array_map(
               (FunktionElement a)
               {
                   return a.ausgeben();
               },
               this.op))
           + "\\right)";
   }

}
*/
var UnaryOperation = /** @class */ (function (_super) {
    __extends(UnaryOperation, _super);
    function UnaryOperation(op) {
        var _this = _super.call(this) || this;
        _this.op = op;
        return _this;
    }
    UnaryOperation.prototype.isNumeric = function () {
        return this.op.isNumeric();
    };
    UnaryOperation.prototype.isConstant = function () {
        return this.op.isConstant();
    };
    UnaryOperation.prototype.ausgeben = function (outerPrecedence) {
        if (outerPrecedence === void 0) { outerPrecedence = 0; }
        //ausgeben gibt mit Klammern aus
        return "\\mathrm{" + this.constructor.toString() + "}\\left(" + this.op.ausgeben() + '\\right)';
    };
    UnaryOperation.prototype.inlineAusgeben = function (outerPrecedence) {
        if (outerPrecedence === void 0) { outerPrecedence = 0; }
        return this.constructor.toString() + '(' + this.op.inlineAusgeben() + ")";
    };
    return UnaryOperation;
}(FunktionElement));
var BinaryOperation = /** @class */ (function (_super) {
    __extends(BinaryOperation, _super);
    function BinaryOperation(op1, op2) {
        var _this = _super.call(this) || this;
        _this.op1 = op1;
        _this.op2 = op2;
        return _this;
    }
    BinaryOperation.prototype.isNumeric = function () {
        return this.op1.isNumeric() && this.op2.isNumeric();
    };
    BinaryOperation.prototype.isConstant = function () {
        return this.op1.isConstant() && this.op2.isConstant();
    };
    BinaryOperation.prototype.ausgeben = function (outerPrecedence) {
        if (outerPrecedence === void 0) { outerPrecedence = 0; }
        var innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "\\left(" + this.normalAusgeben(this.op1.ausgeben(innerPrec), this.op2.ausgeben(innerPrec)) + "\\right)";
        return this.normalAusgeben(this.op1.ausgeben(innerPrec), this.op2.ausgeben(innerPrec));
    };
    BinaryOperation.prototype.normalAusgeben = function (left, right) {
        return this.normalInlineAusgeben(left, right);
    };
    BinaryOperation.prototype.inlineAusgeben = function (outerPrecedence) {
        if (outerPrecedence === void 0) { outerPrecedence = 0; }
        var innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "(" + this.normalInlineAusgeben(this.op1.inlineAusgeben(innerPrec), this.op2.inlineAusgeben(innerPrec)) + ")";
        return this.normalInlineAusgeben(this.op1.inlineAusgeben(innerPrec), this.op2.inlineAusgeben(innerPrec));
    };
    BinaryOperation.prototype.precedence = function () { return 3; };
    return BinaryOperation;
}(FunktionElement));
var Variable = /** @class */ (function (_super) {
    __extends(Variable, _super);
    function Variable(name, inner, useInner) {
        if (inner === void 0) { inner = null; }
        if (useInner === void 0) { useInner = false; }
        var _this = _super.call(this) || this;
        _this.useinner = false;
        _this.name = name;
        _this.inner = inner != null ? inner.simplified() : null;
        _this.useinner = useInner;
        return _this;
    }
    Variable.prototype.derivative = function () {
        if (Variable.workVariable == this.name)
            return Numeric.one;
        else if (this.useInner)
            return this.inner.derivative();
        return Numeric.zero;
    };
    Variable.prototype.ausgeben = function (outerPrecendence) {
        if (outerPrecendence === void 0) { outerPrecendence = 0; }
        return this.isConstant()
            ? (this.isNumeric()
                ? this.inner.getValue().ausgeben()
                : (this.useInner()
                    ? "\\mathbf{" + this.name + '}'
                    : "" + this.name))
            : "\\mathit{" + this.name + "}";
    };
    Variable.prototype.inlineAusgeben = function (outerPrecedence) {
        if (outerPrecedence === void 0) { outerPrecedence = 0; }
        return this.name;
    };
    Variable.prototype.simplified = function () {
        if (this.useInner())
            //ist schon simplified
            return this.inner; //.simplified();
        else
            return this;
    };
    Variable.prototype.isNumeric = function () {
        return this.isConstant() && this.useInner() && this.inner.isNumeric();
    };
    Variable.prototype.useInner = function () {
        if (Variable.noNumerics)
            return this.name == 'i';
        return this.useinner;
    };
    Variable.prototype.isConstant = function () {
        return this.name != Variable.workVariable && (!this.useInner() || this.inner.isConstant());
    };
    // wirft entweder Fehler, oder rechnet mit nichtssagenden, konstanten Werten, wenn
    // getValue aufgerufen wird, obwohl diese Variable nicht numeric ist.
    Variable.prototype.getValue = function () {
        if (!this.isNumeric())
            HTMLoutput += "Programmierfehler : getValue on nonnumeric";
        return this.inner.getValue();
    };
    Variable.prototype.isOne = function () {
        return this.isNumeric() && this.getValue().isOne();
    };
    Variable.prototype.isZero = function () {
        return this.isNumeric() && this.getValue().isZero();
    };
    /// Element-wise
    /// Static
    Variable.init = function () {
        //User kann hier eigene "Null-äre Operationen" enumberragen, d.h. Kurzschreibweisen wie sin(3x^2), oder pi+e (vereinfachbar)
        registeredVariables = {
            'τ': new Variable('τ', new Numeric(new FloatReal(2 * Math.PI))),
            'e': new Variable('e', new Numeric(new FloatReal(Math.E))),
            'i': new Variable('i', new Numeric(RationalReal.zero, RationalReal.one), true),
            'φ': new Variable('φ', Numeric.one.add(new sqrt(new Numeric(new RationalReal(5)))).divideBy(Numeric.two), true)
        };
        registeredVariables['π'] = new Variable('π', registeredVariables['τ'].divideBy(Numeric.two), true);
        //TODO tri-Symbol zu Schrift hinzufügen
        registeredVariables['ш'] = new Variable('ш', registeredVariables['τ'].divideBy(new Numeric(new RationalReal(4), new RationalReal(0))), true);
    };
    Variable.ofName = function (name) {
        if (name in registeredVariables)
            return registeredVariables[name];
        var co = new Variable(name);
        registeredVariables[name] = co;
        return co;
    };
    Variable.noNumerics = false;
    Variable.workVariable = '';
    return Variable;
}(FunktionElement));
var Numeric = /** @class */ (function (_super) {
    __extends(Numeric, _super);
    function Numeric(re, im) {
        if (im === void 0) { im = null; }
        var _this = _super.call(this) || this;
        _this.re = re;
        _this.im = im !== null && im !== void 0 ? im : RationalReal.zero;
        return _this;
    }
    Numeric.prototype.reF = function () {
        return this.re.floatValue();
    };
    Numeric.prototype.imF = function () {
        return this.im.floatValue();
    };
    Numeric.prototype.ausgeben = function (outerPrecendence) {
        if (outerPrecendence === void 0) { outerPrecendence = 0; }
        if (this.im.isZero())
            return this.re.ausgeben();
        if (this.re.isZero())
            if (this.im.isOne())
                return "i";
            else
                return this.im.ausgeben() + "i";
        return "\\left[" + this.re.ausgeben() + " + " + this.im.ausgeben() + "i\\right]";
    };
    Numeric.prototype.inlineAusgeben = function (outerPrecendence) {
        if (outerPrecendence === void 0) { outerPrecendence = 0; }
        if (this.im.isZero())
            return this.re.inlineAusgeben();
        if (this.re.isZero())
            return this.im.inlineAusgeben() + "i";
        return "[" + this.re.inlineAusgeben() + " + " + this.im.inlineAusgeben() + "i]";
    };
    Numeric.prototype.derivative = function () {
        return Numeric.zero;
    };
    Numeric.prototype.simplified = function () {
        return this;
        //return new Numeric(this.re.simplified(),this.im.simplified());
    };
    Numeric.prototype.getValue = function () {
        return this;
    };
    Numeric.prototype.isNumeric = function () {
        return true;
    };
    Numeric.prototype.isConstant = function () {
        return true;
    };
    Numeric.prototype.isOne = function () {
        return this.re.isOne() && this.im.isZero();
    };
    Numeric.prototype.isZero = function () {
        return this.re.isZero() && this.im.isZero();
    };
    Numeric.prototype.equalsN = function (other) {
        return this.re.equalsR(other.re) && this.im.equalsR(other.im);
    };
    Numeric.prototype.addN = function (other) {
        return new Numeric(this.re.addR(other.re), this.im.addR(other.im));
    };
    Numeric.prototype.subtractN = function (other) {
        return new Numeric(this.re.subtractR(other.re), this.im.subtractR(other.im));
    };
    Numeric.prototype.negativeN = function () {
        return new Numeric(this.re.negativeR(), this.im.negativeR());
    };
    // 1/z = z* / |z|²
    Numeric.prototype.reciprocalN = function () {
        return new Numeric(this.re.divideByR(this.absSquared()), this.im.divideByR(this.absSquared()).negativeR());
    };
    Numeric.prototype.multiplyN = function (other) {
        return new Numeric(this.re.multiplyR(other.re).subtractR(this.im.multiplyR(other.im)), this.re.multiplyR(other.im).addR(this.im.multiplyR(other.re)));
    };
    //z / w = z mal w* / |w|²
    Numeric.prototype.divideByN = function (other) {
        return new Numeric(this.re.multiplyR(other.re).addR(this.im.multiplyR(other.im))
            .divideByR(other.absSquared()), this.im.multiplyR(other.re).subtractR(this.re.multiplyR(other.im))
            .divideByR(other.absSquared()));
    };
    Numeric.prototype.toPowerN = function (other) {
        var r = this.absF();
        var φ = this.argF();
        return Numeric.ofAbsArg(Math.pow(r, other.reF()) * Math.exp(φ * other.imF()), φ * other.reF() + Math.log(r) * other.imF());
    };
    Numeric.prototype.sqrtN = function () {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrige Wurzel einführen
        return Numeric.ofAbsArg(Math.sqrt(this.absF()), this.argF() / 2);
    };
    Numeric.prototype.argF = function () {
        return Math.atan2(this.imF(), this.reF());
    };
    Numeric.prototype.absSquared = function () {
        return this.re.multiplyR(this.re).addR(this.im.multiplyR(this.im));
    };
    Numeric.prototype.absSquaredF = function () {
        var re = this.reF();
        var im = this.imF();
        return re * re + im * im;
    };
    Numeric.prototype.absF = function () {
        return Math.sqrt(this.absSquaredF());
    };
    Numeric.prototype.isRational = function () {
        return this.re instanceof RationalReal && this.im instanceof RationalReal;
    };
    Numeric.init = function () {
        RationalReal.one = new RationalReal(1);
        RationalReal.zero = new RationalReal(0);
        Numeric.one = new Numeric(RationalReal.one);
        Numeric.zero = new Numeric(RationalReal.zero);
        Numeric.two = new Numeric(new RationalReal(2));
        Numeric.infinity = new InfinityNumeric();
    };
    Numeric.ofAbsArg = function (r, arg) {
        return Numeric.ofF(r * Math.cos(arg), r * Math.sin(arg));
    };
    Numeric.ofF = function (reF, imF) {
        if (imF === void 0) { imF = 0; }
        return new Numeric(Real.ofF(reF), Real.ofF(imF));
    };
    return Numeric;
}(FunktionElement));
var InfinityNumeric = /** @class */ (function (_super) {
    __extends(InfinityNumeric, _super);
    function InfinityNumeric() {
        return _super.call(this, new FloatReal(NaN), new FloatReal(NaN)) || this;
    }
    InfinityNumeric.prototype.isOne = function () {
        return false;
    };
    InfinityNumeric.prototype.isZero = function () {
        return false;
    };
    InfinityNumeric.prototype.equalsN = function (other) {
        return false; //todo
    };
    InfinityNumeric.prototype.addN = function (other) {
        if (other instanceof InfinityNumeric)
            return null;
        return this;
    };
    InfinityNumeric.prototype.subtractN = function (other) {
        if (other instanceof InfinityNumeric)
            return null; //Todo
        return this;
    };
    InfinityNumeric.prototype.negativeN = function () {
        return this;
    };
    InfinityNumeric.prototype.reciprocalN = function () {
        return Numeric.zero;
    };
    InfinityNumeric.prototype.multiplyN = function (other) {
        if (other.isZero())
            return null; //Todo
        return this;
    };
    InfinityNumeric.prototype.divideByN = function (other) {
        if (other instanceof InfinityNumeric)
            return null; //Todo
        return this;
    };
    InfinityNumeric.prototype.toPowerN = function (other) {
        if (other.isZero())
            return null; //Todo
        return this;
    };
    InfinityNumeric.prototype.absSquared = function () {
        return new FloatReal(Infinity);
    };
    InfinityNumeric.prototype.argF = function () {
        return NaN;
    };
    InfinityNumeric.prototype.ausgeben = function (outerPrecendence) {
        if (outerPrecendence === void 0) { outerPrecendence = 0; }
        return "\\infty";
    };
    InfinityNumeric.prototype.inlineAusgeben = function (outerPrecendence) {
        if (outerPrecendence === void 0) { outerPrecendence = 0; }
        return '∞';
    };
    return InfinityNumeric;
}(Numeric));
var Real = /** @class */ (function () {
    function Real() {
    }
    Real.ofF = function (reF) {
        return (new FloatReal(reF)).simplified();
    };
    return Real;
}());
var FloatReal = /** @class */ (function (_super) {
    __extends(FloatReal, _super);
    /**
     * FloatReal constructor. USE ONLY WHEN VALUE IS DEFINITELY NOT RATIONAL, else use Real.ofF-function
     * @param number value
     */
    function FloatReal(value) {
        var _this = _super.call(this) || this;
        _this.value = 0.0;
        _this.value = value;
        return _this;
    }
    FloatReal.prototype.ausgeben = function () {
        return this.inlineAusgeben();
    };
    FloatReal.prototype.inlineAusgeben = function () {
        if (FloatReal.displayDigits > 0) {
            return this.value.toLocaleString(commaIsDecimalPoint ? 'en-us' : 'de-de').substring(0, FloatReal.displayDigits);
        }
        return this.value.toString();
    };
    FloatReal.prototype.floatValue = function () {
        return this.value;
    };
    FloatReal.prototype.isZero = function () {
        return this.value == 0;
    };
    FloatReal.prototype.isOne = function () {
        return this.value == 1;
    };
    FloatReal.prototype.equalsR = function (other) {
        var epsilon = Number.EPSILON;
        var absA = Math.abs(this.value);
        var absB = Math.abs(other.floatValue());
        var diff = Math.abs(this.value - other.floatValue());
        if (this.floatValue() == other.floatValue()) { // shortcut, handles infinities
            return true;
        }
        else if (this.floatValue() == 0 || other.floatValue() == 0 || (absA + absB < Number.MIN_VALUE)) {
            // a or b is zero or both are extremely close to it
            // relative error is less meaningful here
            return diff < Number.MIN_VALUE;
        }
        else { // use relative error
            return diff / Math.min((absA + absB), Number.MAX_VALUE) < epsilon;
        }
    };
    FloatReal.prototype.addR = function (other) {
        return new FloatReal(this.value + other.floatValue());
    };
    FloatReal.prototype.subtractR = function (other) {
        return new FloatReal(this.value - other.floatValue());
    };
    FloatReal.prototype.multiplyR = function (other) {
        return new FloatReal(this.value * other.floatValue());
    };
    FloatReal.prototype.divideByR = function (other) {
        return new FloatReal(this.value / other.floatValue());
    };
    FloatReal.prototype.negativeR = function () {
        return new FloatReal(-this.value);
    };
    FloatReal.prototype.reciprocalR = function () {
        return new FloatReal(1 / this.value);
    };
    FloatReal.prototype.simplified = function () {
        //if(this.value % 1 == 0.0 && Math.abs(this.value) <= Number.MAX_SAFE_INTEGER){
        if (Number.isInteger(this.value)) {
            return RationalReal.of(this.value);
        }
        //ALGORITHM TO CONVERT FLOAT TO RATIONAL
        //Vorkommastellen
        var vks = Math.floor(this.value);
        //Nachkommastellen (jetztiger / letzter)
        var nks = this.value - vks;
        //jetztiger / letzter , d.h. erster Bruch ist einfach der Ganzzahlteil der Zahl/1
        var num = vks;
        var den = 1;
        //letzter / vorletzter , d.h. "vorerster Bruch 1/0"
        var oldNum = 1;
        var oldDen = 0;
        while (Math.abs(this.value - num / den) > floatToRationalTolerance) {
            var zahl = 1 / nks;
            vks = Math.floor(zahl);
            nks = zahl - vks;
            //Zähler und Nenner auf vks mal den letzten, plus den vorletzten (Z|N) setzen
            var temp = num;
            num = vks * num + oldNum;
            oldNum = temp;
            temp = den;
            den = vks * den + oldDen;
            oldDen = temp;
            //Abbrechen bei zu großem Nenner
            if (den > floatToRationalMaxDen)
                return this;
        }
        return new RationalReal(num, den);
    };
    FloatReal.displayDigits = 30;
    return FloatReal;
}(Real));
/**
 * Class RationalReal
 * represents a rational number as a reduced fraction with a positve denominator
 */
var RationalReal = /** @class */ (function (_super) {
    __extends(RationalReal, _super);
    function RationalReal(num, den) {
        if (den === void 0) { den = 1; }
        var _this = _super.call(this) || this;
        if (den == 0) {
            HTMLoutput += "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
            HTMLoutput += "ich habe das jetzt mal zu einer 1 geändert...<br>";
            den = 1;
        }
        if (den < 0) {
            _this.den = -den;
            _this.num = -num;
        }
        else {
            _this.num = num;
            _this.den = den;
        }
        _this.simplify();
        return _this;
    }
    RationalReal.prototype.ausgeben = function () {
        if (this.den == 1 || this.num == 0)
            return this.num.toString();
        return RationalReal.fractionAusgeben(this.num, this.den);
    };
    RationalReal.prototype.inlineAusgeben = function () {
        if (this.den == 1 || this.num == 0)
            return this.num.toString();
        return this.num + '/' + this.den;
    };
    RationalReal.prototype.isOne = function () {
        return this.num == this.den;
    };
    RationalReal.prototype.isZero = function () {
        return this.num == 0;
    };
    RationalReal.prototype.simplify = function () {
        var g = RationalReal.gcd(this.num, this.den);
        this.num = this.num / g;
        this.den = this.den / g;
    };
    RationalReal.prototype.floatValue = function () {
        return this.num / this.den;
    };
    RationalReal.prototype.equalsR = function (other) {
        if (other instanceof RationalReal) {
            return this.num == other.num && this.den == other.den;
        }
        return other.equalsR(this);
    };
    RationalReal.prototype.addR = function (other) {
        if (other instanceof RationalReal) {
            //ggT der Nenner
            var g = RationalReal.gcd(this.den, other.den);
            var b = this.den / g;
            var d = other.den / g;
            //this.den * d ist auch der kgV (lcm) der Nenner
            return new RationalReal(this.num * d + other.num * b, this.den * d);
        }
        else
            return new FloatReal(this.floatValue() + other.floatValue());
    };
    RationalReal.prototype.subtractR = function (other) {
        if (other instanceof RationalReal) {
            //ggT der Nenner
            var g = RationalReal.gcd(this.den, other.den);
            var b = this.den / g;
            var d = other.den / g;
            //this.den * d ist auch der kgV (lcm) der Nenner
            return new RationalReal(this.num * d - other.num * b, this.den * d);
        }
        else
            return new FloatReal(this.floatValue() - other.floatValue());
    };
    RationalReal.prototype.multiplyR = function (other) {
        if (other instanceof RationalReal) {
            var num = this.num * other.num;
            var den = this.den * other.den;
            return RationalReal.of(num, den);
        }
        return new FloatReal(this.floatValue() * other.floatValue());
    };
    RationalReal.prototype.divideByR = function (other) {
        if (other instanceof RationalReal) {
            var num = this.num * other.den;
            var den = this.den * other.num;
            return RationalReal.of(num, den);
        }
        return new FloatReal(this.floatValue() / other.floatValue());
    };
    RationalReal.prototype.negativeR = function () {
        return new RationalReal(-this.num, this.den);
    };
    RationalReal.prototype.reciprocalR = function () {
        return RationalReal.of(this.den, this.num);
    };
    ////////////////
    RationalReal.of = function (num, den) {
        if (num === void 0) { num = 0; }
        if (den === void 0) { den = 1; }
        if (num == 0)
            return RationalReal.zero;
        if (num == den)
            return RationalReal.one;
        if (Number.isSafeInteger(num) && Number.isSafeInteger(den))
            return new RationalReal(num, den);
        throw "Not safe integers: " + num + ", " + den + ".";
    };
    RationalReal.fractionAusgeben = function (num, den) {
        return "\\frac{" + num + "}{" + den + "}";
    };
    /**
     * Greatest common divisor of numbers "a" and "b"
     * @param number a only natural numbers
     * @param number b only natural numbers
     * @return number
     */
    RationalReal.gcd = function (a, b) {
        var r;
        do {
            r = a % b;
            a = b;
            b = r;
        } while (b > 0);
        return a;
    };
    /**
     * Least common multiple of numbers "a" and "b"
     * @param number a only natural numbers
     * @param number b only natural numbers
     * @return number
     */
    RationalReal.lcm = function (a, b) {
        return (a * b) / RationalReal.gcd(a, b);
    };
    return RationalReal;
}(Real));
Numeric.init();
Variable.init();
