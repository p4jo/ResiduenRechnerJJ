//GLOBAL CONSTANTS
const floatToRationalTolerance = Number.EPSILON;
const floatToRationalMaxDen = 100000;
const displayDigits = 30;
var registeredVariables;
// TODO: Auch Operationen müssen, wie Variablen, nur zu Numerics vereinfacht werden dürfen, wenn das gewünscht ist
// (z.B. Additionen immer erlaubt (oder bei rational plus number nicht), aber Wurzel und ln nicht erlaubt, weil das in Zahlen in mathematischer Notation auch stehen bleibt
// Enter any new Operator here. By default Operators are left-grouping within their precedence class, add key
// 'rightAssociative' if meant otherwise
const operations = {
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
    '!': { 'name': 'Factorial', 'arity': 1, 'precedence': 5 },
};
/**
 * Class FunktionElement: IMMUTABLE
 */
class FunktionElement {
    isOne() {
        return false;
    }
    isZero() {
        return false;
    }
    equals(other) {
        if (this.isNumeric() != other.isNumeric() || this.isConstant() != other.isConstant())
            return false;
        if (this.isNumeric() && other.isNumeric())
            return other.getValue().equalsN(this.getValue());
        return null;
    }
    //ENDE ABSTRAKTE FUNKTIONEN
    add(other) {
        return new Addition(this, other);
    }
    subtract(other) {
        return new Subtraction(this, other);
    }
    multiply(other) {
        return new Multiplikation(this, other);
    }
    divideBy(other) {
        return new Division(this, other);
    }
    toPower(other) {
        return new Potenz(this, other);
    }
    sqrt() {
        return new sqrt(this);
    }
}
/**
 * Alle Funktionen sollten als Unterklassen von den Operation - Klassen definiert werden,
 * sie können simplify und müssen ableiten überschreiben, statische Funktionen sollten nicht
 * und ausgeben muss nicht überschrieben werden.
 * Jeder Operator und jede Funktion muss in operations eingetragen werden.
 */
class Operation extends FunktionElement {
    constructor(...op) {
        super();
        this.op = op;
    }
    isNumeric() {
        let result = true;
        for (let index in this.op) {
            result = result && this.op[index].isNumeric();
        }
        return result;
    }
    isConstant() {
        let result = true;
        for (let index in this.op) {
            result = result && this.op[index].isConstant();
        }
        return result;
    }
    display(outerPrecendence = 0) {
        return "\\mathrm{" + this.constructor.name + "}\\left(" +
            this.op.map(a => a.display()).join(', ') + "\\right)";
    }
}
class UnaryOperation extends FunktionElement {
    constructor(op) {
        super();
        this.op = op;
    }
    isNumeric() {
        return this.op.isNumeric();
    }
    isConstant() {
        return this.op.isConstant();
    }
    display(outerPrecedence = 0) {
        //ausgeben gibt mit Klammern aus
        return "\\mathrm{" + this.constructor.name + "}\\left(" + this.op.display() + '\\right)';
    }
    displayInline(outerPrecedence = 0) {
        return this.constructor.name + '(' + this.op.displayInline() + ")";
    }
}
class BinaryOperation extends FunktionElement {
    constructor(op1, op2) {
        super();
        this.op1 = op1;
        this.op2 = op2;
    }
    isNumeric() {
        return this.op1.isNumeric() && this.op2.isNumeric();
    }
    isConstant() {
        return this.op1.isConstant() && this.op2.isConstant();
    }
    display(outerPrecedence = 0) {
        var innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "\\left(" + this.displayNormally(this.op1.display(innerPrec), this.op2.display(innerPrec)) + "\\right)";
        return this.displayNormally(this.op1.display(innerPrec), this.op2.display(innerPrec));
    }
    displayNormally(left, right) {
        return this.diplayInlineNormally(left, right);
    }
    displayInline(outerPrecedence = 0) {
        var innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "(" + this.diplayInlineNormally(this.op1.displayInline(innerPrec), this.op2.displayInline(innerPrec)) + ")";
        return this.diplayInlineNormally(this.op1.displayInline(innerPrec), this.op2.displayInline(innerPrec));
    }
    precedence() { return 3; }
}
let Variable = /** @class */ (() => {
    class Variable extends FunktionElement {
        constructor(name, inner = null, useInner = false) {
            super();
            this.useinner = false;
            this.name = name;
            this.inner = inner != null ? inner.simplified() : null;
            this.useinner = useInner;
        }
        derivative() {
            if (Variable.workVariable == this.name)
                return Numeric.one;
            else if (this.useInner())
                return this.inner.derivative();
            return Numeric.zero;
        }
        display(outerPrecendence = 0) {
            return this.isConstant()
                ? (this.isNumeric()
                    ? this.inner.getValue().display()
                    : (this.useInner()
                        ? "\\mathbf{" + this.name + '}'
                        : "" + this.name))
                : "\\mathit{" + this.name + "}";
        }
        displayInline(outerPrecedence = 0) {
            return this.name;
        }
        simplified() {
            if (this.useInner())
                //ist schon simplified
                return this.inner; //.simplified();
            else
                return this;
        }
        isNumeric() {
            return this.useInner() && this.isConstant() && this.inner.isNumeric();
        }
        useInner() {
            if (this.inner === null)
                return false;
            //alert("inner is not null on " + this.name);
            if (!Variable.activateInner)
                return this.name == 'i';
            //alert("nonumerics is false")
            return this.useinner;
        }
        isConstant() {
            return this.name != Variable.workVariable && (!this.useInner() || this.inner.isConstant());
        }
        // wirft entweder Fehler, oder rechnet mit nichtssagenden, konstanten Werten, wenn
        // getValue aufgerufen wird, obwohl diese Variable nicht numeric ist.
        getValue() {
            if (!this.isNumeric())
                HTMLoutput += "Programmierfehler : getValue on nonnumeric";
            return this.inner.getValue();
        }
        isOne() {
            return this.isNumeric() && this.getValue().isOne();
        }
        isZero() {
            return this.isNumeric() && this.getValue().isZero();
        }
        /// Element-wise
        /// Static
        static init() {
            //User kann hier eigene "Null-äre Operationen" enumberragen, d.h. Kurzschreibweisen wie sin(3x^2), oder pi+e (vereinfachbar)
            registeredVariables = {
                'τ': new Variable('τ', new Numeric(new FloatReal(2 * Math.PI))),
                'e': new Variable('e', new Numeric(new FloatReal(Math.E))),
                'i': new Variable('i', new Numeric(RationalReal.zero, RationalReal.one), true),
                'φ': new Variable('φ', Numeric.one.add(new sqrt(new Numeric(new RationalReal(5)))).divideBy(Numeric.two))
            };
            registeredVariables['π'] = new Variable('π', registeredVariables['τ'].divideBy(Numeric.two), true);
            //TODO tri-Symbol zu Schrift hinzufügen
            registeredVariables['ш'] = new Variable('ш', registeredVariables['τ'].divideBy(new Numeric(new RationalReal(4), new RationalReal(0))), true);
        }
        static ofName(name) {
            if (name in registeredVariables)
                return registeredVariables[name];
            var co = new Variable(name);
            registeredVariables[name] = co;
            return co;
        }
    }
    Variable.activateInner = true;
    Variable.workVariable = '';
    return Variable;
})();
class Numeric extends FunktionElement {
    constructor(re, im = null) {
        super();
        this.re = re;
        this.im = im ?? RationalReal.zero;
    }
    reF() {
        return this.re.floatValue();
    }
    imF() {
        return this.im.floatValue();
    }
    display(outerPrecendence = 0) {
        if (this.im.isZero())
            return this.re.display();
        if (this.re.isZero())
            if (this.im.isOne())
                return "i";
            else
                return this.im.display() + "i";
        return "\\left[" + this.re.display() + " + " + this.im.display() + "i\\right]";
    }
    displayInline(outerPrecendence = 0) {
        if (this.im.isZero())
            return this.re.displayInline();
        if (this.re.isZero())
            return this.im.displayInline() + "i";
        return "[" + this.re.displayInline() + " + " + this.im.displayInline() + "i]";
    }
    derivative() {
        return Numeric.zero;
    }
    simplified() {
        return this;
        //return new Numeric(this.re.simplified(),this.im.simplified());
    }
    getValue() {
        return this;
    }
    isNumeric() {
        return true;
    }
    isConstant() {
        return true;
    }
    isOne() {
        return this.re.isOne() && this.im.isZero();
    }
    isZero() {
        return this.re.isZero() && this.im.isZero();
    }
    equalsN(other) {
        return this.re.equalsR(other.re) && this.im.equalsR(other.im);
    }
    addN(other) {
        return new Numeric(this.re.addR(other.re), this.im.addR(other.im));
    }
    subtractN(other) {
        return new Numeric(this.re.subtractR(other.re), this.im.subtractR(other.im));
    }
    negativeN() {
        return new Numeric(this.re.negativeR(), this.im.negativeR());
    }
    // 1/z = z* / |z|²
    reciprocalN() {
        return new Numeric(this.re.divideByR(this.absSquared()), this.im.divideByR(this.absSquared()).negativeR());
    }
    multiplyN(other) {
        return new Numeric(this.re.multiplyR(other.re).subtractR(this.im.multiplyR(other.im)), this.re.multiplyR(other.im).addR(this.im.multiplyR(other.re)));
    }
    //z / w = z mal w* / |w|²
    divideByN(other) {
        return new Numeric(this.re.multiplyR(other.re).addR(this.im.multiplyR(other.im))
            .divideByR(other.absSquared()), this.im.multiplyR(other.re).subtractR(this.re.multiplyR(other.im))
            .divideByR(other.absSquared()));
    }
    toPowerN(other) {
        var r = this.absF();
        var φ = this.argF();
        return Numeric.ofAbsArg(Math.pow(r, other.reF()) * Math.exp(φ * other.imF()), φ * other.reF() + Math.log(r) * other.imF());
    }
    sqrtN() {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrige Wurzel einführen
        return Numeric.ofAbsArg(Math.sqrt(this.absF()), this.argF() / 2);
    }
    argF() {
        return Math.atan2(this.imF(), this.reF());
    }
    absSquared() {
        return this.re.multiplyR(this.re).addR(this.im.multiplyR(this.im));
    }
    absSquaredF() {
        var re = this.reF();
        var im = this.imF();
        return re * re + im * im;
    }
    absF() {
        return Math.sqrt(this.absSquaredF());
    }
    isRational() {
        return this.re instanceof RationalReal && this.im instanceof RationalReal;
    }
    static init() {
        RationalReal.one = new RationalReal(1);
        RationalReal.zero = new RationalReal(0);
        Numeric.one = new Numeric(RationalReal.one);
        Numeric.zero = new Numeric(RationalReal.zero);
        Numeric.two = new Numeric(new RationalReal(2));
        Numeric.infinity = new InfinityNumeric();
    }
    static ofAbsArg(r, arg) {
        return Numeric.ofF(r * Math.cos(arg), r * Math.sin(arg));
    }
    static ofF(reF, imF = 0) {
        return new Numeric(Real.ofF(reF), Real.ofF(imF));
    }
}
class InfinityNumeric extends Numeric {
    constructor() {
        super(new FloatReal(NaN), new FloatReal(NaN));
    }
    isOne() {
        return false;
    }
    isZero() {
        return false;
    }
    equalsN(other) {
        return false; //todo
    }
    addN(other) {
        if (other instanceof InfinityNumeric)
            return null;
        return this;
    }
    subtractN(other) {
        if (other instanceof InfinityNumeric)
            return null; //Todo
        return this;
    }
    negativeN() {
        return this;
    }
    reciprocalN() {
        return Numeric.zero;
    }
    multiplyN(other) {
        if (other.isZero())
            return null; //Todo
        return this;
    }
    divideByN(other) {
        if (other instanceof InfinityNumeric)
            return null; //Todo
        return this;
    }
    toPowerN(other) {
        if (other.isZero())
            return null; //Todo
        return this;
    }
    absSquared() {
        return new FloatReal(Infinity);
    }
    argF() {
        return NaN;
    }
    display(outerPrecendence = 0) {
        return "\\infty";
    }
    displayInline(outerPrecendence = 0) {
        return '∞';
    }
}
class Real {
    /**
     * Returns new Real number. If it is very close to a rational number with limited denominator it is simplified to a RationalReal
     */
    static ofF(reF) {
        //ALGORITHM TO CONVERT FLOAT TO RATIONAL
        let zahl = reF, vks, nks, num = 1, den = 0, oldNum = 0, oldDen = 1;
        do {
            //Vorkommastellen
            vks = Math.floor(zahl);
            //Nachkommastellen
            nks = zahl - vks;
            //Zähler und Nenner auf vks mal den letzten, plus den vorletzten (Z|N) setzen
            [num, oldNum] = [vks * num + oldNum, num];
            [den, oldDen] = [vks * den + oldDen, den];
            //Abbrechen bei zu großem Nenner
            if (den > floatToRationalMaxDen)
                return new FloatReal(reF);
            zahl = 1 / nks;
        } while (Math.abs(reF - num / den) > floatToRationalTolerance);
        return RationalReal.of(num, den);
    }
}
class FloatReal extends Real {
    /**
     * FloatReal constructor. USE ONLY WHEN VALUE IS DEFINITELY NOT RATIONAL, else use Real.ofF-function
     */
    constructor(value) {
        super();
        this.value = 0.0;
        this.value = value;
    }
    display() {
        return this.displayInline();
    }
    displayInline() {
        if (displayDigits > 0) {
            /*
            let thousands_sep = '\'';
            let dec_point = commaIsDecimalPoint ? ',' : '.';
            return number_format( this.value, displayDigits, dec_point, thousands_sep);
            */
            return this.value.toLocaleString(commaIsDecimalPoint ? 'en-us' : 'de-de', { minimumFractionDigits: 0, maximumFractionDigits: displayDigits });
        }
        return this.value.toString();
    }
    floatValue() {
        return this.value;
    }
    isZero() {
        return this.value == 0;
    }
    isOne() {
        return this.value == 1;
    }
    equalsR(other) {
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
    }
    addR(other) {
        return Real.ofF(this.value + other.floatValue());
    }
    subtractR(other) {
        return Real.ofF(this.value - other.floatValue());
    }
    multiplyR(other) {
        return Real.ofF(this.value * other.floatValue());
    }
    divideByR(other) {
        return Real.ofF(this.value / other.floatValue());
    }
    negativeR() {
        return new FloatReal(-this.value);
    }
    reciprocalR() {
        return new FloatReal(1 / this.value);
    }
}
/**
 * Class RationalReal
 * represents a rational number as a reduced fraction with a positve denominator
 */
class RationalReal extends Real {
    constructor(num, den = 1) {
        super();
        if (den == 0) {
            HTMLoutput += "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
            HTMLoutput += "ich habe das jetzt mal zu einer 1 geändert...<br>";
            den = 1;
        }
        if (den < 0) {
            this.den = -den;
            this.num = -num;
        }
        else {
            this.num = num;
            this.den = den;
        }
        this.simplify();
    }
    display() {
        if (this.den == 1 || this.num == 0)
            return this.num.toString();
        return RationalReal.fractionAusgeben(this.num, this.den);
    }
    displayInline() {
        if (this.den == 1 || this.num == 0)
            return this.num.toString();
        return this.num + '/' + this.den;
    }
    isOne() {
        return this.num == this.den;
    }
    isZero() {
        return this.num == 0;
    }
    simplify() {
        let g = RationalReal.gcd(this.num, this.den);
        this.num /= g;
        this.den /= g;
    }
    floatValue() {
        return this.num / this.den;
    }
    equalsR(other) {
        if (other instanceof RationalReal) {
            return this.num == other.num && this.den == other.den;
        }
        return other.equalsR(this);
    }
    addR(other) {
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
    }
    subtractR(other) {
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
    }
    multiplyR(other) {
        if (other instanceof RationalReal) {
            var num = this.num * other.num;
            var den = this.den * other.den;
            return RationalReal.of(num, den);
        }
        return Real.ofF(this.floatValue() * other.floatValue());
    }
    divideByR(other) {
        if (other instanceof RationalReal) {
            var num = this.num * other.den;
            var den = this.den * other.num;
            return RationalReal.of(num, den);
        }
        return Real.ofF(this.floatValue() / other.floatValue());
    }
    negativeR() {
        return new RationalReal(-this.num, this.den);
    }
    reciprocalR() {
        return RationalReal.of(this.den, this.num);
    }
    ////////////////
    static of(num = 0, den = 1) {
        if (num == 0)
            return RationalReal.zero;
        if (num == den)
            return RationalReal.one;
        if (Number.isSafeInteger(num) && Number.isSafeInteger(den))
            return new RationalReal(num, den);
        throw "Not safe integers: " + num + ", " + den + ".";
    }
    static fractionAusgeben(num, den) {
        return "\\frac{" + num + "}{" + den + "}";
    }
    /**
     * Greatest common divisor of numbers "a" and "b"
     * @param number a only natural numbers
     * @param number b only natural numbers
     * @return number
     */
    static gcd(a, b) {
        var r;
        do {
            r = a % b;
            a = b;
            b = r;
        } while (b > 0);
        return a;
    }
    /**
     * Least common multiple of numbers "a" and "b"
     * @param number a only natural numbers
     * @param number b only natural numbers
     * @return number
     */
    static lcm(a, b) {
        return (a * b) / RationalReal.gcd(a, b);
    }
}
Numeric.init();
