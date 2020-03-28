function inObject(needle, haystack, argStrict = true) {
    var key = '';
    var strict = !!argStrict;
    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) {
                return true;
            }
        }
    }
    else {
        for (key in haystack) {
            if (haystack[key] == needle) {
                return true;
            }
        }
    }
    return false;
}
function dump(obj) {
    var out = '';
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }
    alert(out);
}
function number_format(n, decimals = null, decPoint = '.', thousandsSep = '') {
    if (!decPoint)
        decPoint = '.';
    if (!thousandsSep)
        thousandsSep = '';
    if (n == null || !isFinite(n)) {
        throw new TypeError("n is not valid");
    }
    let maxDec = (n.toString() + '.').split('.')[1].length;
    decimals = decimals == null ? maxDec : Math.min(decimals, maxDec);
    var splitNum = n.toFixed(decimals).split('.');
    splitNum[0] = splitNum[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    return splitNum.join(decPoint);
}
var formData;
var HTMLoutput;
var registeredVariables;
var workVariable;
var funktion;
var commaIsDecimalPoint = false;
const floatToRationalTolerance = Number.EPSILON;
const floatToRationalMaxDen = 100000;
const displayDigits = 8;
var registeredVariables;
const operations = {
    '+': { 'name': 'Addition', 'arity': 2, 'precedence': 2 },
    '-': { 'name': 'Subtraction', 'arity': 2, 'precedence': 2 },
    '/': { 'name': 'Division', 'arity': 2, 'precedence': 4 },
    '÷': { 'name': 'Division', 'arity': 2, 'precedence': 3 },
    ':': { 'name': 'Division', 'arity': 2, 'precedence': 3 },
    '*': { 'name': 'Multiplication', 'arity': 2, 'precedence': 3 },
    '×': { 'name': 'Multiplication', 'arity': 2, 'precedence': 3 },
    '·': { 'name': 'Multiplication', 'arity': 2, 'precedence': 3 },
    '^': { 'name': 'Potenz', 'arity': 2, 'precedence': 4, 'rightAssociative': 1 },
    'sin': { 'name': 'sin', 'arity': 1, 'precedence': 5 },
    'cos': { 'name': 'cos', 'arity': 1, 'precedence': 5 },
    'ln': { 'name': 'ln', 'arity': 1, 'precedence': 5 },
    'sqrt': { 'name': 'sqrt', 'arity': 1, 'precedence': 5 },
    'Wurzel': { 'name': 'sqrt', 'arity': 1, 'precedence': 5 },
    'ζ': { 'name': 'RiemannZeta', 'arity': 1, 'precedence': 5 },
    '!': { 'name': 'Factorial', 'arity': 1, 'precedence': 5 },
};
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
    add(other) {
        return new Addition(this, other);
    }
    subtract(other) {
        return new Subtraction(this, other);
    }
    multiply(other) {
        return new Multiplication(this, other);
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
        return this.displayInlineNormally(left, right);
    }
    displayInline(outerPrecedence = 0) {
        var innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "(" + this.displayInlineNormally(this.op1.displayInline(innerPrec), this.op2.displayInline(innerPrec)) + ")";
        return this.displayInlineNormally(this.op1.displayInline(innerPrec), this.op2.displayInline(innerPrec));
    }
}
let Variable = (() => {
    class Variable extends FunktionElement {
        constructor(name, inner = null, useInner = false) {
            super();
            this.useinner = false;
            this.name = name;
            this.inner = inner != null ? inner.simplified() : null;
            this.useinner = useInner;
        }
        derivative() {
            if (workVariable == this.name)
                return Numeric.one;
            else if (this.useInner())
                return this.inner.derivative();
            return Numeric.zero;
        }
        display(outerPrecendence = 0) {
            if (this.useInner())
                return "\\operatorname{\\mathbf{" + this.name + '}}';
            if (!this.isConstant())
                return "\\operatorname{\\mathtt{" + this.name + "}}";
            return "\\operatorname{\\mathit{" + this.name + '}}';
        }
        displayInline(outerPrecedence = 0) {
            return this.name;
        }
        simplified() {
            if (this.useInner())
                return this.inner.simplified();
            else
                return this;
        }
        isNumeric() {
            return this.useInner() && this.isConstant() && this.inner.isNumeric();
        }
        useInner() {
            if (this.inner === null)
                return false;
            if (Variable.activateInner || this.name == workVariable)
                return this.useinner;
            return this.name == 'i';
        }
        isConstant() {
            return this.name != workVariable && (!this.useInner() || this.inner.isConstant());
        }
        getValue() {
            if (!this.isNumeric())
                HTMLoutput += "Programmierfehler : getValue on nonnumeric Variable <br>";
            return this.inner.getValue();
        }
        isOne() {
            return this.isNumeric() && this.getValue().isOne();
        }
        isZero() {
            return this.isNumeric() && this.getValue().isZero();
        }
        static init() {
            registeredVariables = {
                'τ': new Variable('τ', new Numeric(new FloatReal(2 * Math.PI))),
                'e': new Variable('e', new Numeric(new FloatReal(Math.E))),
                'i': new Variable('i', new Numeric(Real.zero, Real.one), true),
                'φ': new Variable('φ', Numeric.one.add(new sqrt(new Numeric(new RationalReal(5)))).divideBy(Numeric.two))
            };
            registeredVariables['π'] = new Variable('π', registeredVariables['τ'].divideBy(Numeric.two), true);
            registeredVariables['ш'] = new Variable('ш', registeredVariables['τ'].divideBy(new Numeric(new RationalReal(4), Real.zero)), true);
            registeredVariables['°'] = new Variable('°', registeredVariables['τ'].divideBy(new Numeric(new RationalReal(360), Real.zero)), true);
        }
        static ofName(name) {
            if (!(name in registeredVariables))
                registeredVariables[name] = new Variable(name);
            return registeredVariables[name];
        }
    }
    Variable.activateInner = true;
    return Variable;
})();
class Numeric extends FunktionElement {
    constructor(re, im = null) {
        super();
        this.re = re;
        this.im = im ?? Real.zero;
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
    reciprocalN() {
        return new Numeric(this.re.divideByR(this.absSquared()), this.im.divideByR(this.absSquared()).negativeR());
    }
    multiplyN(other) {
        return new Numeric(this.re.multiplyR(other.re).subtractR(this.im.multiplyR(other.im)), this.re.multiplyR(other.im).addR(this.im.multiplyR(other.re)));
    }
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
        Real.one = new RationalReal(1);
        Real.zero = new RationalReal(0);
        Numeric.one = new Numeric(Real.one);
        Numeric.zero = new Numeric(Real.zero);
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
        return false;
    }
    addN(other) {
        if (other instanceof InfinityNumeric)
            return null;
        return this;
    }
    subtractN(other) {
        if (other instanceof InfinityNumeric)
            return null;
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
            return null;
        return this;
    }
    divideByN(other) {
        if (other instanceof InfinityNumeric)
            return null;
        return this;
    }
    toPowerN(other) {
        if (other.isZero())
            return null;
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
    static ofF(reF) {
        let zahl = reF, vks, nks, num = 1, den = 0, oldNum = 0, oldDen = 1;
        do {
            vks = Math.floor(zahl);
            nks = zahl - vks;
            [num, oldNum] = [vks * num + oldNum, num];
            [den, oldDen] = [vks * den + oldDen, den];
            if (den > floatToRationalMaxDen)
                return new FloatReal(reF);
            zahl = 1 / nks;
        } while (Math.abs(reF - num / den) > floatToRationalTolerance);
        return RationalReal.of(num, den);
    }
}
class FloatReal extends Real {
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
            let thousands_sep = commaIsDecimalPoint ? '\'' : ',';
            let dec_point = commaIsDecimalPoint ? ',' : '.';
            return number_format(this.value, displayDigits, dec_point, thousands_sep);
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
        if (this.floatValue() == other.floatValue()) {
            return true;
        }
        else if (this.floatValue() == 0 || other.floatValue() == 0 || (absA + absB < Number.MIN_VALUE)) {
            return diff < Number.MIN_VALUE;
        }
        else {
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
class RationalReal extends Real {
    constructor(num, den = 1) {
        super();
        if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den))
            throw "Not safe integers: " + num + ", " + den + ".";
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
        let g = RationalReal.gcd(this.num, this.den);
        this.num /= g;
        this.den /= g;
        if (!Number.isSafeInteger(this.num) || !Number.isSafeInteger(this.den))
            throw "MADE Not safe integers: " + this.num + ", " + this.den + ".";
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
            var g = RationalReal.gcd(this.den, other.den);
            var b = this.den / g;
            var d = other.den / g;
            return new RationalReal(this.num * d + other.num * b, this.den * d);
        }
        return Real.ofF(this.floatValue() + other.floatValue());
    }
    subtractR(other) {
        if (other instanceof RationalReal) {
            var g = RationalReal.gcd(this.den, other.den);
            var b = this.den / g;
            var d = other.den / g;
            return new RationalReal(this.num * d - other.num * b, this.den * d);
        }
        return Real.ofF(this.floatValue() - other.floatValue());
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
    static of(num = 0, den = 1) {
        if (num == 0)
            return Real.zero;
        if (num == den)
            return Real.one;
        return new RationalReal(num, den);
    }
    static fractionAusgeben(num, den) {
        return "\\frac{" + num + "}{" + den + "}";
    }
    static gcd(a, b) {
        if (a * b == 0)
            return 1;
        a = Math.abs(a);
        b = Math.abs(b);
        do {
            [a, b] = [b, a % b];
        } while (b > 0);
        return a;
    }
    static lcm(a, b) {
        return (a * b) / RationalReal.gcd(a, b);
    }
}
Numeric.init();
class AdditionType extends BinaryOperation {
    precedence() { return 2; }
    constructor(op1, op2) {
        super(op1 ?? Numeric.zero, op2 ?? Numeric.zero);
    }
    allSummands() {
        let numeric = Numeric.zero;
        let list;
        if (this.op1.isNumeric())
            numeric = this.op1.getValue();
        else if (this.op1 instanceof AdditionType)
            [numeric, list] = this.op1.allSummands();
        else if (this.op1 instanceof MultiplicationType) {
            var factors = this.op1.allFactors();
            list.push(this.op1);
        }
        if (this.op2.isNumeric()) {
            if (this instanceof Addition)
                numeric = numeric.addN(this.op2.getValue());
            else
                numeric = numeric.subtractN(this.op2.getValue());
        }
        else if (this.op2 instanceof AdditionType) {
            const summ = this.op2.allSummands();
            if (this instanceof Addition)
                numeric = numeric.addN(summ[0]);
            else
                numeric = numeric.subtractN(summ[0]);
            list = list.concat(summ[1]);
        }
        else
            list.push(this.op2);
        return [numeric, list];
    }
    simplify() {
        if (this.op1.isZero()) {
            if (this instanceof Addition)
                return this.op2;
            return this;
        }
        if (this.op2.isZero()) {
            return this.op1;
        }
        return this;
    }
    isMultipleOf(variable) {
        return Numeric.zero;
    }
}
class Addition extends AdditionType {
    displayInlineNormally(left, right) {
        return left + " + " + right;
    }
    derivative() {
        return this.isConstant() ? Numeric.zero : this.op1.derivative().add(this.op2.derivative());
    }
    getValue() {
        return this.op1.getValue().addN(this.op2.getValue());
    }
    simplified() {
        let simpler = new Addition(this.op1.simplified(), this.op2.simplified());
        if (simpler.isNumeric()) {
            return simpler.getValue();
        }
        return simpler.simplify();
    }
}
class Subtraction extends AdditionType {
    displayInlineNormally(left, right) {
        return left + '-' + right;
    }
    derivative() {
        return this.isConstant() ? Numeric.zero : this.op1.derivative().subtract(this.op2.derivative());
    }
    getValue() {
        return this.op1.getValue().subtractN(this.op2.getValue());
    }
    simplified() {
        let simpler = new Subtraction(this.op1.simplified(), this.op2.simplified());
        if (simpler.isNumeric()) {
            return simpler.getValue();
        }
        if (simpler.op1.equals(simpler.op2))
            return Numeric.zero;
        return simpler.simplify();
    }
}
class MultiplicationType extends BinaryOperation {
    precedence() { return 3; }
    constructor(op1, op2) {
        super(op1 ?? Numeric.one, op2 ?? Numeric.one);
    }
    allFactors() {
        return null;
    }
}
class Multiplication extends MultiplicationType {
    displayNormally(left, right) {
        return left + '\\cdot ' + right;
    }
    displayInlineNormally(left, right) {
        return left + '·' + right;
    }
    derivative() {
        return this.isConstant() ? Numeric.zero :
            this.op1.derivative().multiply(this.op2).add(this.op1.multiply(this.op2.derivative()));
    }
    simplified() {
        let simpler = new Multiplication(this.op1.simplified(), this.op2.simplified());
        if (simpler.isNumeric()) {
            return simpler.getValue();
        }
        for (let index in registeredVariables) {
            let currentVariable = registeredVariables[index];
            if ((this.op1 instanceof Potenz || this.op1 instanceof MultiplicationType) && (this.op2 instanceof Potenz || this.op2 instanceof MultiplicationType)) {
                let mul1 = this.op1.isMultipleOf(currentVariable);
                let mul2 = this.op1.isMultipleOf(currentVariable);
                if (!mul1.isZero() && !mul2.isZero()) {
                    return new Multiplication(new Potenz(currentVariable, new Addition(mul1, mul2).simplified()), new Multiplication(this.op1.removeVariable(currentVariable), this.op2.removeVariable(currentVariable).simplified()));
                }
            }
        }
        return simpler;
    }
    getValue() {
        return this.op1.getValue().multiplyN(this.op2.getValue());
    }
    isMultipleOf(variable) {
        if (this.op1 == variable || this.op2 == variable) {
            return Numeric.one;
        }
        return Numeric.zero;
    }
    removeVariable(variable) {
        if (this.op1 == variable) {
            return this.op2;
        }
        else if (this.op2 == variable) {
            return this.op1;
        }
        else {
            if (this.op1 instanceof Potenz || this.op1 instanceof Multiplication || this.op1 instanceof Division) {
                this.op1 = this.op1.removeVariable(variable);
            }
            if (this.op2 instanceof Potenz || this.op2 instanceof Multiplication || this.op2 instanceof Division) {
                this.op2 = this.op2.removeVariable(variable);
            }
        }
        return this;
    }
}
class Division extends MultiplicationType {
    constructor(op1, op2) {
        super(op1, op2);
        if (this.op2.isZero()) {
            HTMLoutput += "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
            HTMLoutput += "ich habe das jetzt mal zu einer 1 geändert...<br>";
            this.op2 = Numeric.one;
        }
    }
    display(outerPrecedence = 0) {
        if (outerPrecedence > this.precedence())
            return "\\left(" + this.displayNormally(this.op1.display(), this.op2.display()) + "\\right)";
        return this.displayNormally(this.op1.display(), this.op2.display());
    }
    displayNormally(left, right) {
        return RationalReal.fractionAusgeben(left, right);
    }
    displayInlineNormally(left, right) {
        return left + " ÷ " + right;
    }
    derivative() {
        return this.isConstant() ? Numeric.zero : new Division(new Subtraction(new Multiplication(this.op1.derivative(), this.op2), new Multiplication(this.op1, this.op2.derivative())), new Potenz(this.op2, Numeric.ofF(2)));
    }
    simplified() {
        let simpler = new Division(this.op1.simplified(), this.op2.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        if (simpler.op1.equals(simpler.op2))
            return Numeric.one;
        return simpler;
    }
    getValue() {
        return this.op1.getValue().divideByN(this.op2.getValue());
    }
    isMultipleOf(variable) {
        if (this.op1 == variable || this.op2 == variable) {
            return Numeric.one;
        }
        return Numeric.zero;
    }
    removeVariable(variable) {
        if (this.op1 == variable) {
            return this.op2;
        }
        else if (this.op2 == variable) {
            return this.op1;
        }
        else {
            if (this.op1 instanceof Potenz || this.op1 instanceof Multiplication || this.op1 instanceof Division) {
                this.op1 = this.op1.removeVariable(variable);
            }
            if (this.op2 instanceof Potenz || this.op2 instanceof Multiplication || this.op2 instanceof Division) {
                this.op2 = this.op2.removeVariable(variable);
            }
        }
        return this;
    }
}
class Potenz extends BinaryOperation {
    precedence() { return 4; }
    constructor(op1, op2) {
        super(op1 ?? registeredVariables['e'], op2 ?? Numeric.one);
    }
    display(outerPrecedence = 0) {
        let innerPrec = this.precedence();
        if (outerPrecedence >= innerPrec)
            return "\\left(" + this.displayNormally(this.op1.display(innerPrec), this.op2.display()) + "\\right)";
        return this.displayNormally(this.op1.display(innerPrec), this.op2.display());
    }
    displayInline(outerPrecedence = 0) {
        let innerPrec = this.precedence();
        if (outerPrecedence >= innerPrec)
            return "(" + this.displayInlineNormally(this.op1.displayInline(innerPrec), this.op2.displayInline()) + ")";
        return this.displayInlineNormally(this.op1.displayInline(innerPrec), this.op2.displayInline());
    }
    displayNormally(left, right) {
        return left + "^{" + right + "}";
    }
    displayInlineNormally(left, right) {
        return left + "^(" + right + ")";
    }
    derivative() {
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
    }
    simplified() {
        let simpler = new Potenz(this.op1.simplified(), this.op2.simplified());
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
    }
    getValue() {
        return this.op1.getValue().toPowerN(this.op2.getValue());
    }
    isMultipleOf(variable) {
        if (this.op1 == variable) {
            if (this.op2.isNumeric) {
                return this.op2.getValue();
            }
        }
        return Numeric.zero;
    }
    removeVariable(variable) {
        if (this.op1 == variable) {
            return this.op2;
        }
        else if (this.op2 == variable) {
            return this.op1;
        }
        else {
            if (this.op1 instanceof Potenz || this.op1 instanceof Multiplication || this.op1 instanceof Division) {
                this.op1 = this.op1.removeVariable(variable);
            }
            if (this.op2 instanceof Potenz || this.op2 instanceof Multiplication || this.op2 instanceof Division) {
                this.op2 = this.op2.removeVariable(variable);
            }
        }
        return this;
    }
}
class sqrt extends UnaryOperation {
    getValue() {
        return this.op.getValue().sqrtN();
    }
    display(outerPrecendence = 0) {
        return "\\sqrt{" + this.op.display() + "}";
    }
    derivative() {
        return this.isConstant() ? Numeric.zero : this.op.derivative().divideBy(Numeric.two.multiply(this));
    }
    simplified() {
        if (this.isNumeric())
            return this.getValue();
        let simplerop = this.op.simplified();
        if (simplerop instanceof Potenz) {
            simplerop.op2 = simplerop.op2.divideBy(Numeric.two);
            return simplerop;
        }
        return new sqrt(simplerop);
    }
    isNumeric() {
        if (!this.op.isNumeric())
            return false;
        if (this.getValue().isRational() || !this.op.getValue().isRational())
            return true;
        return false;
    }
}
class cos extends UnaryOperation {
    derivative() {
        return this.isConstant() ? Numeric.zero : (Numeric.ofF(-1)).multiply(new sin(this.op)).multiply(this.op.derivative());
    }
    getValue() {
        let v = this.op.getValue();
        return Numeric.ofF(Math.cos(v.reF()) * Math.cosh(v.imF()), -Math.sin(v.reF()) * Math.sinh(v.imF()));
    }
    simplified() {
        let simpler = new cos(this.op.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        return simpler;
    }
}
class sin extends UnaryOperation {
    derivative() {
        return this.isConstant() ? Numeric.zero : (new cos(this.op)).multiply(this.op.derivative());
    }
    getValue() {
        let v = this.op.getValue();
        return Numeric.ofF(Math.sin(v.reF()) * Math.cosh(v.imF()), Math.cos(v.reF()) * Math.sinh(v.imF()));
    }
    simplified() {
        let simpler = new sin(this.op.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        return simpler;
    }
}
class ln extends UnaryOperation {
    derivative() {
        return this.isConstant() ? Numeric.zero : this.op.derivative().divideBy(this.op);
    }
    getValue() {
        return Numeric.ofF(Math.log(this.op.getValue().absSquaredF()) / 2, this.op.getValue().argF());
    }
    simplified() {
        let simpler = new ln(this.op.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        return simpler;
    }
}
class EntireFunktion {
    constructor(inner, name = 'f', input = null) {
        this.inner = inner;
        this.name = name;
        this.input = input ?? Variable.ofName(workVariable);
    }
    display() {
        return "\\( \\operatorname{" + this.name + "}\\left(" + this.input.display() + "\\right) =  " + this.inner.display() + "\\)";
    }
    simplified() {
        return new EntireFunktion(this.inner.simplified(), this.name, this.input.simplified());
    }
    derivative() {
        return new EntireFunktion(this.inner.derivative(), this.name + "'", this.input);
    }
    valueAt(x) {
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
let Parser = (() => {
    class Parser {
        static init() {
            Parser.numChars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '\''];
            Parser.separatorChars = [';'];
            if (commaIsDecimalPoint)
                Parser.numChars.push(',');
            else {
                Parser.separatorChars.push(',');
            }
            let specialChars = [
                "#",
                "%",
                "&",
                "*",
                "+",
                "-",
                "/",
                ":",
                ";",
                "?",
                "@",
                "^",
                "_",
                "|",
                "~",
                "‖",
                "×",
                "·",
                "¶",
                "±",
                "¤",
                "÷",
                "‼",
                "⌂"
            ].concat(Parser.separatorChars);
            Parser.singleCharacterTokens = specialChars.concat(Parser.leftBraceChars, Parser.rightBraceChars);
            Parser.forbiddenToMultiplyWithMeChars = specialChars.concat(Parser.rightBraceChars);
            Parser.forbiddenToMultiplyMeTokens = specialChars.concat(Parser.leftBraceChars, Object.keys(operations));
        }
        static parseStringToFunktionElement(inputStr) {
            if (inputStr == null || inputStr == '')
                return Numeric.zero;
            let tokens = Parser.tokenize(inputStr);
            let RPN = Parser.parseTokensToRPN(tokens);
            return Parser.parseRPNToFunktionElement(RPN);
        }
        static tokenize(input) {
            let tokens = [];
            for (let i = 0; i < input.length; i++) {
                let chr = input[i];
                if (chr.trim() === '') {
                    continue;
                }
                if (tokens.length > 0 &&
                    !Parser.forbiddenToMultiplyMeTokens.includes(tokens[tokens.length - 1]) &&
                    !Parser.forbiddenToMultiplyWithMeChars.includes(chr)) {
                    tokens.push("·");
                }
                if (Parser.singleCharacterTokens.includes(chr)) {
                    tokens.push(chr);
                }
                else if (Parser.numChars.includes(chr)) {
                    let number = chr;
                    let isInt = true;
                    while (input.length > i + 1 && Parser.numChars.includes(input[i + 1])) {
                        let digit = input[++i];
                        if (digit == '.' || digit == ',') {
                            digit = isInt ? '.' : '';
                            isInt = false;
                        }
                        if (digit != '\'')
                            number += digit;
                    }
                    tokens.push(parseFloat(number));
                }
                else if (Parser.letterChar.includes(chr)) {
                    let text = chr;
                    while (input.length > i + 1 && Parser.letterChar.includes(input[i + 1]))
                        text += input[++i];
                    if (text in Parser.namedChars)
                        tokens.push(Parser.namedChars[text]);
                    else
                        tokens.push(text);
                }
                else {
                    HTMLoutput += "Achtung, das Zeichen " + input[i] + " an Stelle i: von \"" + input + "\" wurde übergangen (invalid)";
                }
            }
            return tokens;
        }
        static precedence(token) {
            if (token in operations)
                return operations[token]['precedence'];
            return -1;
        }
        static parseTokensToRPN(tokens) {
            let output_queue = [];
            let operator_stack = [];
            let wasOperand = false;
            for (let j = 0; j in tokens; j++) {
                let token = tokens[j];
                if (typeof token == 'number') {
                    output_queue.push(token);
                    wasOperand = true;
                }
                else if (token in operations) {
                    if (!wasOperand && operations[token]['arity'] >= 2 && !(j + 1 in tokens && Parser.leftBraceChars.includes(tokens[j + 1]))) {
                        output_queue.push(null);
                    }
                    let myOP = Parser.precedence(token);
                    while (true) {
                        if (operator_stack.length == 0)
                            break;
                        let earlierOP = Parser.precedence(operator_stack[operator_stack.length - 1]);
                        if (earlierOP > myOP ||
                            (earlierOP == myOP && !('rightAssociative' in operations[operator_stack[operator_stack.length - 1]])))
                            output_queue.push(operator_stack.pop());
                        else
                            break;
                    }
                    operator_stack.push(token);
                    wasOperand = false;
                }
                else if (Parser.leftBraceChars.includes(token)) {
                    operator_stack.push('(');
                    wasOperand = false;
                }
                else if (Parser.rightBraceChars.includes(token)) {
                    while (operator_stack[operator_stack.length - 1] !== '(') {
                        output_queue.push(operator_stack.pop());
                        if (operator_stack.length == 0) {
                            HTMLoutput += "Zu wenige öffnende Klammern.<br>";
                            break;
                        }
                    }
                    operator_stack.pop();
                    wasOperand = true;
                }
                else if (Parser.separatorChars.includes(token)) {
                    if (operator_stack[operator_stack.length - 1] !== '(')
                        output_queue.push('');
                    while (operator_stack[operator_stack.length - 1] !== '(') {
                        output_queue.push(operator_stack.pop());
                        if (operator_stack.length == 0) {
                            HTMLoutput += "Zu wenige öffnende Klammern.<br>";
                            break;
                        }
                    }
                    wasOperand = false;
                }
                else {
                    output_queue.push(token);
                    wasOperand = true;
                }
            }
            while (operator_stack.length > 0) {
                let token = operator_stack.pop();
                if (token == '(') {
                    HTMLoutput += "Zu viele öffnende Klammern!<br>";
                }
                else
                    output_queue.push(token);
            }
            return output_queue;
        }
        static parseRPNToFunktionElement(RPNQueue) {
            if (RPNQueue.length == 0)
                return Numeric.zero;
            Parser.stack = [];
            for (var index in RPNQueue) {
                let token = RPNQueue[index];
                let funkEl = Parser.parseRPNToFunctionElementInternal(token);
                Parser.stack.push(funkEl);
            }
            let result = Parser.stack.pop();
            if (Parser.stack.length > 0)
                HTMLoutput += "HÄ? {"
                    + Parser.stack.map(a => a.display()).join(', ')
                    + "} is the stack left after parsing RPNQueue: {"
                    + RPNQueue.join(', ')
                    + "}<br>";
            return result;
        }
        static parseRPNToFunctionElementInternal(token) {
            if (token === null)
                return null;
            if (typeof token == "number")
                return Numeric.ofF(token);
            if (token in operations) {
                switch (operations[token]['arity']) {
                    case 1:
                        let op = Parser.stack.pop();
                        return new Function('a', "return new " + [operations[token]['name']] + "(a);")(op);
                    case 2:
                        let o2 = Parser.stack.pop();
                        let o1 = Parser.stack.pop();
                        return new Function('a', 'b', "return new " + [operations[token]['name']] + "(a, b);")(o1, o2);
                    default:
                        let args = [];
                        for (let i = 0; i < operations[token]['arity']; i++)
                            args.push(Parser.stack.pop());
                        return new Function('a', "return new " + [operations[token]['name']] + "(a);")(args.reverse());
                }
            }
            else
                return Variable.ofName(token);
        }
    }
    Parser.letterChar = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'ä', 'ö', 'ü', 'ß', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
        'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
        'W', 'X', 'Y', 'Z', 'Ä', 'Ö', 'Ü', 'ς', 'ε', 'ρ', 'τ', 'υ', 'θ',
        'ι', 'ο', 'π', 'λ', 'κ', 'ξ', 'η', 'γ', 'φ', 'δ', 'σ', 'α', 'ζ',
        'χ', 'ψ', 'ω', 'β', 'ν', 'μ', 'Ε', 'Ρ', 'Τ', 'Υ', 'Θ', 'Ι', 'Ο',
        'Π', 'Λ', 'Κ', 'Ξ', 'Η', 'Γ', 'Φ', 'Δ', 'Σ', 'Α', 'Ζ', 'Χ', 'Ψ',
        'Ω', 'Β', 'Ν', 'Μ', 'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш',
        'щ', 'з', 'х', 'э', 'ж', 'д', 'л', 'о', 'р', 'п', 'а', 'в',
        'ы', 'ф', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'Й',
        'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Э', 'Ж',
        'Д', 'Л', 'О', 'Р', 'П', 'А', 'В', 'Ы', 'Ф', 'Я', 'Ч', 'С',
        'М', 'И', 'Т', 'Ь', 'Б', 'Ю', '\'', '°'];
    Parser.namedChars = { 'alpha': 'α', 'beta': 'β', 'pi': 'π', 'tri': 'ш' };
    Parser.leftBraceChars = ['(', '[', '{', '<', '«'];
    Parser.rightBraceChars = [')', ']', '}', '>', '»'];
    return Parser;
})();
Parser.init();
Variable.init();
window.MathJax = {
    config: {
        options: {
            menuOptions: {
                settings: {
                    renderer: 'SVG',
                    inTabOrder: false,
                },
            }
        },
        svg: {
            mathmlSpacing: false,
            linebreaks: true
        },
        startup: {
            output: 'svg'
        },
        loader: {
            load: ['output/svg', '[tex]/unicode']
        },
        tex: {
            maxBuffer: 10240,
            packages: {
                '[+]': ['unicode']
            },
            digits: /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/
        }
    }
};
function updateLocale() {
    Parser.init();
    window.MathJax.config.tex.digits = commaIsDecimalPoint ?
        /^(?:[0-9]+(?:\{'\}[0-9]{3})*(?:\,[0-9]*)?|\,[0-9]+)/ :
        /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/;
    MathJax.startup.getComponents();
}
function relevantData(element) {
    if (element instanceof HTMLInputElement) {
        if (element.type === "text")
            return element.value;
        if (element.type === "checkbox")
            return element.checked;
    }
    return null;
}
function loadData() {
    formData = {};
    let interestingInputs = document.getElementsByClassName("II");
    for (let index in interestingInputs) {
        let element = interestingInputs[index];
        if (!(element instanceof Element))
            break;
        formData[element.id] = relevantData(element);
    }
}
function updateInputData() {
    loadData();
    workVariable = formData["workVariable"];
    commaIsDecimalPoint = formData["cIDP"];
    updateLocale();
}
function sendHTMLIntoDiv(htmlCode, outputDiv) {
    var div = document.getElementById("ausgabe" + outputDiv);
    div.innerHTML = htmlCode;
    mathReload();
}
function sendOutputIntoDiv(outputFunction, outputDiv) {
    HTMLoutput = '';
    outputFunction();
    sendHTMLIntoDiv(HTMLoutput, outputDiv);
}
function mathReload() {
    MathJax.typesetPromise();
}
function funktionSubmit() {
    updateInputData();
    sendOutputIntoDiv(Ausgabe1, 1);
    showVariableList();
    sendHTMLIntoDiv('', 3);
}
function reloadSecondArea() {
    updateInputData();
    sendOutputIntoDiv(Ausgabe2, 1);
    showVariableList();
}
function showVariableList() {
    sendOutputIntoDiv(VariableListHTM, 2);
}
function parseFunktion() {
    funktion = new EntireFunktion(Parser.parseStringToFunktionElement(formData["formel"]), "f");
}
function Ausgabe1() {
    Variable.activateInner = false;
    HTMLoutput += "Keine Variablen außer i werden eingesetzt.<br>";
    parseFunktion();
    Ausgabe();
}
function Ausgabe2() {
    Variable.activateInner = true;
    updateVariables();
    Ausgabe();
}
function Ausgabe() {
    HTMLoutput += "Eingabe: " + funktion.display() + "<br>";
    let residuePoint = Parser.parseStringToFunktionElement(formData["residuePoint"]);
    let Df = new Array(4);
    Df[0] = funktion.simplified();
    for (let i = 1; i < 4; i++) {
        Df[i] = Df[i - 1].derivative().simplified();
    }
    for (let i = 0; i < 4; i++) {
        HTMLoutput += i + "-te Ableitung: " + Df[i].display() + " mit Wert " + Df[i].valueAt(residuePoint).display() + "<br>";
    }
}
function VariableListHTM() {
    HTMLoutput += "<form onsubmit='{event.preventDefault(); reloadSecondArea();}'><fieldset>";
    for (let index in registeredVariables) {
        let variable = registeredVariables[index];
        let valN = variable.inner;
        let mathOutput = '\\textrm{(nicht gesetzt)}';
        let output = '';
        if (valN != null) {
            mathOutput = valN.display();
            output = valN.displayInline();
        }
        let temp = variable.useinner ? "checked='checked'" : '';
        HTMLoutput +=
            `\\( ${variable.display()} = ${mathOutput} \\).  
        <label> Setze eigenen Wert: 
            <input class='II' type='text' id='input_${variable.name}' value='${output}' size='20'>. 
        </label> 
        <label>Direkt einsetzen:  
            <input class='II' type='checkbox' id='check_${variable.name}' ${temp} ">
        </label><br>`;
    }
    HTMLoutput += `</fieldset> <br> <Button type = 'submit'> Aktualisieren </Button> </form>`;
}
function updateVariables() {
    for (var key in registeredVariables) {
        let variable = registeredVariables[key];
        if (formData["input_" + variable.name] != null &&
            formData["input_" + variable.name] != ((variable.inner != null) ? variable.inner.displayInline() : '')) {
            variable.inner = Parser.parseStringToFunktionElement(formData["input_" + variable.name]);
        }
        variable.useinner = ("check_" + variable.name in formData) && formData["check_" + variable.name];
    }
}
