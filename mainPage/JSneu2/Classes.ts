
const floatToRationalTolerance: number = 1e-10;
const floatToRationalMaxDen: number = 100000;

Numeric.init();
Variable.init();


// TODO: Auch Operationen müssen, wie Variablen, nur zu Numerics vereinfacht werden dürfen, wenn das gewünscht ist
// (z.B. Additionen immer erlaubt (oder bei rational plus number nicht), aber Wurzel und ln nicht erlaubt, weil das in Zahlen in mathematischer Notation auch stehen bleibt

// Enter any new Operator here. By default Operators are left-grouping within their precedence class, add key
// 'rightAssociative' if meant otherwise
operations = {
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
abstract class FunktionElement {
    abstract ausgeben(outerPrecedence : number): string;
    abstract inlineAusgeben(outerPrecedence: number): string;

    abstract derivative() : FunktionElement;

    abstract simplified() : FunktionElement ;

    /**
     * bezüglich der konstanten Variablen konstant
     */
    abstract isNumeric() : boolean ;

    /**
     * bezüglich der Arbeitsvariablen konstant
     */
    abstract isConstant() : boolean ;

    isOne() : boolean {
        return false;
    }
    isZero() : boolean {
        return false;
    }

    // WARNING: ONLY CALL ON (RELATIVELY) NUMERIC OBJECTS
    abstract getValue() : Numeric ;


    equals(other: FunktionElement) : boolean
    {
        if (this.isNumeric() != other.isNumeric() || this.isConstant() != other.isConstant())
            return false;
        if (this.isNumeric() && other.isNumeric())
            return other.getValue().equalsN(this.getValue());
        return null;
    }

    //ENDE ABSTRAKTE FUNKTIONEN

    add (other: FunktionElement) : Addition {
        return new Addition(this,other);
    }
    subtract (other: FunktionElement) : Subtraktion {
        return new Subtraktion(this,other);
    }
    multiply (other: FunktionElement) : Multiplikation {
        return new Multiplikation(this,other);
    }
    divideBy (other: FunktionElement) : Division {
        return new Division(this,other);
    }
    toPower (other: FunktionElement) : Potenz {
        return new Potenz(this,other);
    }
    sqrt() : sqrt {
        return new sqrt(this);
    }


}

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
abstract class UnaryOperation extends FunktionElement {

    protected op: FunktionElement;

    constructor(op : FunktionElement)
    {
        this.op = op;
    }

    isNumeric(): boolean
    {
        return this.op.isNumeric();
    }

    isConstant(): boolean
    {
        return this.op.isConstant();
    }

    ausgeben(outerPrecedence : number = 0) : string //Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        //ausgeben gibt mit Klammern aus
        return "\\mathrm{" + this.constructor.toString() + "}\\left(" + this.op.ausgeben(0) + '\\right)';
    }

    inlineAusgeben(outerPrecedence : number = 0) : string //Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        return this.constructor.toString() .'('. this.op.inlineAusgeben() + ")";
    }

}

abstract class BinaryOperation extends FunktionElement  {

    op1: FunktionElement;
    op2: FunktionElement;

    constructor(op1 : FunktionElement, op2: FunktionElement)
    {
        super();
        this.op1 = op1;
        this.op2 = op2;
    }

    isNumeric(): boolean
    {
        return this.op1.isNumeric() && this.op2.isNumeric();
    }

    isConstant(): boolean
    {
        return this.op1.isConstant() && this.op2.isConstant();
    }

    ausgeben(outerPrecendence : number = 0) : string    {
        innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "\\left(" + this.normalAusgeben(this.op1.ausgeben(innerPrec), this.op2.ausgeben(innerPrec)) + "\\right)";
        return this.normalAusgeben(this.op1.ausgeben(innerPrec), this.op2.ausgeben(innerPrec));
    }

    normalAusgeben(left,right){
        return this.normalInlineAusgeben(left,right);
    }

    inlineAusgeben(outerPrecendence : number = 0) : string    {
        innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "(" + this.normalInlineAusgeben(this.op1.inlineAusgeben(innerPrec), this.op2.inlineAusgeben(innerPrec)) + ")";
        return this.normalInlineAusgeben(this.op1.inlineAusgeben(innerPrec), this.op2.inlineAusgeben(innerPrec));
    }

    abstract normalInlineAusgeben(left,right);

    precedence() : number { return 3; }

}

class Variable extends FunktionElement
{
    static noNumerics : boolean = false;
    static workVariable : string= '';

    name : string;
    inner : FunktionElement;
    useinner : boolean = false;

    private constructor(name : string, inner : FunktionElement = null, useInner : boolean = false)
    {
        super();
        this.name = name;
        this.inner = inner != null ? inner.simplified() : null;
        this.useinner = useInner;
    }

    derivative() : FunktionElement
    {
        if (self.workVariable == this.name)
            return Numeric.one();
        else if (this.useInner)
            return this.inner.derivative();
        return Numeric.zero();
    }

    ausgeben(outerPrecendence : number = 0) : string    {
        return this.isConstant()
                ?(this.isNumeric()
                    ? this.inner.getValue().ausgeben()
                    : (this.useInner()
                        ? "\\mathbf{" + this.name + '}'
                        : "" + this.name ))
                :"\\mathit{" + this.name + "}" ;
    }

    inlineAusgeben(outerPrecedence : number= 0) : string    {
        return this.name;
    }

    simplified() : FunktionElement
    {
        if (this.useInner())
            //ist schon simplified
            return this.inner;//.simplified();
        else
            return this;
    } 

    isNumeric(): boolean
    {
        return this.isConstant() && this.useInner() && this.inner.isNumeric();
    }

    useInner(): boolean
    {
        if (self.noNumerics)
            return this.name == 'i';
        return this.useinner;
    }

    isConstant(): boolean
    {
        return this.name != self.workVariable && (!this.useInner() || this.inner + isConstant());
    }

    // wirft entweder Fehler, oder rechnet mit nichtssagenden, konstanten Werten, wenn
    // getValue aufgerufen wird, obwohl diese Variable nicht numeric ist.
    getValue() : Numeric
    {
        if (!this.isNumeric())
            result += "Programmierfehler : getValue on nonnumeric";
        return this.inner.getValue();
    }

    isOne(): boolean
    {
        return this.isNumeric() && this.getValue().isOne();
    }

    isZero(): boolean
    {
        return this.isNumeric() && this.getValue().isZero();
    }

    /// Element-wise
    /// Static

    static init(){
        global registeredVariables;
        //User kann hier eigene "Null-äre Operationen" enumberragen, d.h. Kurzschreibweisen wie sin(3x^2), oder pi+e (vereinfachbar)
        registeredVariables = {
            'τ' : new Variable ('τ', new Numeric(new FloatReal(2*pi()))),
            'e' : new Variable ('e', new Numeric(new FloatReal(2.718281828459045235))),
            'i' : new Variable ('i', new Numeric(RationalReal.zero, RationalReal.one), true),
            'φ' : new Variable('φ', Numeric.one() + add(new sqrt(new Numeric(new RationalReal(5)))) + divideBy(Numeric.two()), true)
        };
        registeredVariables['π'] = new Variable('π', registeredVariables['τ'].divideBy(Numeric.two()), true);
        //TODO tri-Symbol zu Schrift hinzufügen
        registeredVariables['ш'] = new Variable('ш', registeredVariables['τ'] .divideBy(new Numeric(new RationalReal(4),new RationalReal(0))), true);
    }

    static ofName(name) : FunktionElement
    {
        if (name in registeredVariables)
            return registeredVariables[name];

        var co = new Variable(name);
        registeredVariables[name] = co;
        return co;
    }

}

class Numeric extends FunktionElement
{
    readonly im : Real;
    readonly re : Real;

    reF() : number {
        return this.re.floatValue();
    }

    imF() : number {
        return this.im.floatValue();
    }
    constructor(re : Real, im: Real = null)
    {
        super();
        this.re = re;
        this.im = im ?? RationalReal.zero;
    }

    ausgeben(outerPrecendence : number = 0) : string {
        if (this.im.isZero())
            return this.re.ausgeben();
        if (this.re.isZero())
            if (this.im.isOne())
                return "i";
            else
                return this.im.ausgeben() + "i";
        return "\\left[" + this.re.ausgeben() + " + " + this.im.ausgeben() + "i\\right]";
    }

    inlineAusgeben(outerPrecendence : number = 0) : string {
        if (this.im.isZero())
            return this.re.inlineAusgeben();
        if (this.re.isZero())
            return this.im.inlineAusgeben() + "i";
        return "[" + this.re.inlineAusgeben() + " + " + this.im.inlineAusgeben() + "i]";
    }

    derivative() : FunktionElement {
        return Numeric.zero();
    }

    simplified(): FunktionElement
    {
        return this;
        //return new Numeric(this.re.simplified(),this.im.simplified());
    }

    getValue() : Numeric {
        return this;
    }

    isNumeric(): boolean
    {
        return true;
    }

    isConstant(): boolean
    {
        return true;
    }

    isOne(): boolean
    {
        return this.re.isOne() && this.im.isZero();
    }


    isZero(): boolean
    {
        return this.re.isZero() && this.im.isZero();
    }

    equalsN(other : Numeric)
    {
        return this.re + equalsR (other.re) && this.im.equalsR (other.im);
    }

    addN(other : Numeric) : Numeric
    {
        return new Numeric(this.re .addR (other.re), this.im.addR (other.im));
    }

    subtractN(other : Numeric) : Numeric
    {
        return new Numeric(this.re .subtractR (other.re), this.im .subtractR (other.im));
    }
    negativeN()
    {
        return new Numeric(this.re.negativeR(), this.im.negativeR());
    }

    // 1/z = z* / |z|²

    reciprocalN()
    {
        return new Numeric(this.re.divideByR(this.absSquared()), this.im.divideByR(this.absSquared()).negativeR());
    }
    multiplyN(other : Numeric) : Numeric
    {
        return new Numeric(this.re .multiplyR(other.re)   .subtractR(
            this.im .multiplyR(other.im))  ,
            this.re .multiplyR(other.im) + addR(
                this.im + multiplyR (other.re)));
    }

    //z / w = z mal w* / |w|²

    divideByN(other : Numeric) : Numeric
    {
        return new Numeric(
            this.re + multiplyR (other.re)     .addR(
                this.im .multiplyR (other.im))
                .divideByR(other.absSquared())     ,
            this.im + multiplyR(other.re)      .subtractR(
                this.re .multiplyR(other.im))
                + divideByR (other.absSquared()));
    }

    toPowerN(other : Numeric) : Numeric
    {
        r = this.absF();
        phi = this.argF();
        return Numeric.ofAbsArg(pow(r,other.reF()) * exp(phi * other + imF()),
            phi * other .reF() + log(r) * other.imF());
    }

    sqrtN()
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrige Wurzel einführen
        return Numeric.ofAbsArg(sqrt(this.absF()), this.argF() / 2);
    }

    argF() : number {
        return atan2(this.imF(), this.reF());
    }

    absSquared() : Real {
        re = this.re;
        im = this.im;
        return re .multiplyR(re) .addR(
            im .multiplyR(im));
    }
    absSquaredF() : number {
        re = this.reF();
        im = this.imF();
        return re * re +  im * im;
    }

    absF() : number {
        return sqrt(this.absSquaredF());
    }

    isRational(): boolean
    {
        return this.re instanceof RationalReal && this.im instanceof RationalReal;
    }
    /// Element-wise

    /// Static

    protected static zero : Numeric;
    protected static one : Numeric;
    protected static two : Numeric;
    protected static infinity : Numeric;

    static init() {
        RationalReal.one = new RationalReal(1);
        RationalReal.zero = new RationalReal(0);
        Numeric.one = new Numeric(RationalReal.one);
        Numeric.zero = new Numeric(RationalReal.zero);
        Numeric.two = new Numeric(new RationalReal(2));
        Numeric.infinity = new Infinity();
    }

    static zero() : Numeric {
        return Numeric.zero;
    }

    static one() : Numeric {
        return Numeric.one;
    }

    static two() : Numeric {
        return Numeric.two;
    }

    static infinity() : Numeric {
        return Numeric.infinity;
    }

    static ofAbsArg(number r, number arg) {
        return Numeric.ofF(r * cos(arg),r * sin(arg));
    }

    static ofF(number reF, number imF = 0) : Numeric {
        return new Numeric(Real.ofF(reF), Real.ofF(imF));
    }


}

class Infinity extends Numeric {
    protected constructor()
    {
        super(new FloatReal(NaN), new FloatReal(NaN));
    }

    isOne(): boolean
    {
        return false;
    }

    isZero(): boolean
    {
        return false;
    }

    equalsN(other : Numeric)
    {
        return false; //todo
    }

    addN(other : Numeric): Numeric
    {
        if (other instanceof self)
            return null;
        return this;
    }

    subtractN(other : Numeric): Numeric
    {
        if (other instanceof self)
            return null;//Todo
        return this;
    }

    negativeN()
    {
        return this;
    }

    reciprocalN()
    {
        return parent.zero();
    }

    multiplyN(other : Numeric): Numeric
    {
        if (other.isZero())
            return null;//Todo
        return this;
    }

    divideByN(other : Numeric): Numeric
    {
        if (other instanceof self)
            return null;//Todo
        return this;
    }

    toPowerN(other : Numeric): Numeric
    {
        if (other.isZero())
            return null;//Todo
        return this;
    }

    absSquared(): Real
    {
        return new FloatReal(INF);
    }

    argF(): number
    {
        return NaN;
    }

    ausgeben(outerPrecendence : number = 0): string
    {
        return "\\infty";
    }

    inlineAusgeben(outerPrecendence : number = 0): string
    {
        return '∞';
    }


}

abstract class Real {
    abstract floatValue() : number ;

    abstract ausgeben() : string ;
    abstract inlineAusgeben() : string ;
    abstract isZero() : boolean ;
    abstract isOne() : boolean ;

    abstract equalsR(re : Real) : boolean;
    abstract addR(other: Real) : Real ;
    abstract subtractR(other: Real) : Real ;
    abstract multiplyR(other: Real) : Real ;

    abstract divideByR(other: Real) : Real ;
    abstract negativeR() : Real ;

    abstract reciprocalR() : Real ;

    static ofF(reF : number){
        return (new FloatReal(reF)).simplified();
    }

}

class FloatReal extends Real{
    static displayDigits : number = 30;
    value : number = 0.0;

    /**
     * FloatReal constructor. USE ONLY WHEN VALUE IS DEFINITELY NOT RATIONAL, else use Real.ofF-function
     * @param number value
     */
    constructor(value : number)
    {
        super();
        this.value = value;
    }

    ausgeben() : string {
        return this.inlineAusgeben();
    }

    inlineAusgeben(): string
    {
        if (FloatReal.displayDigits > 0) {
            return this.value.toLocaleString(commaIsDecimalPoint ? 'en-us' : 'de-de').substring(0,FloatReal.displayDigits);
        }
        return this.value.toString();
    }

    floatValue(): number
    {
        return this.value;
    }

    isZero(): boolean
    {
        return this.value == 0;
    }

    isOne(): boolean
    {
        return this.value == 1;
    }

    equalsR(other: Real) : boolean
    {
        epsilon = PHP_FLOAT_EPSILON;
        absA = abs(this.value);
		absB = abs(other.floatValue());
		diff = abs(this.value - other.floatValue());

		if (this.floatValue() == other.floatValue()) { // shortcut, handles infinities
            return true;
        } else if (this.floatValue() == 0 || other.floatValue() == 0 || (absA + absB < PHP_FLOAT_MIN)) {
            // a or b is zero or both are extremely close to it
            // relative error is less meaningful here
            return diff < (epsilon * PHP_FLOAT_MIN);
        } else { // use relative error
            return diff / min((absA + absB), PHP_FLOAT_MAX) < epsilon;
        }
	}

    addR(other: Real) : Real
    {
        return new FloatReal(this.value + other.floatValue());
    }

    subtractR(other: Real) : Real
    {
        return new FloatReal(this.value - other.floatValue());
    }

    multiplyR(other: Real) : Real
    {
        return new FloatReal(this.value * other.floatValue());
    }

    divideByR(other: Real) : Real
    {
        return new FloatReal(this.value / other.floatValue());
    }

    negativeR() : Real
    {
        return new FloatReal(-this.value);
    }

    reciprocalR(): Real
    {
        return new FloatReal(1/this.value);
    }

    simplified(): Real
    {
        if(fmod(this.value, 1) == 0.0 && abs(this.value) <= ){
            return RationalReal.of((number) this.value);
        }
        //ALGORITHM TO CONVERT FLOAT TO RATIONAL

        //Vorkommastellen
        vks = floor(this.value);
        //Nachkommastellen (jetztiger / letzter)
        nks = this.value - vks;
        //jetztiger / letzter , d.h. erster Bruch ist einfach der Ganzzahlteil der Zahl/1
        num = vks;
        den = 1;
        //letzter / vorletzter , d.h. "vorerster Bruch 1/0"
        oldNum = 1;
        oldDen = 0;
        while (abs(this.value - num / den) > floatToRationalTolerance) {
            zahl = 1 / nks;
            vks = floor(zahl);
            nks = zahl - vks;

            //Zähler und Nenner auf vks mal den letzten, plus den vorletzten (Z|N) setzen
            temp = num;
            num = vks * num + oldNum;
            oldNum = temp;

            temp = den;
            den = vks * den + oldDen;
            oldDen = temp;

            //Abbrechen bei zu großem Nenner
            if (den > floatToRationalMaxDen)
                return this;
        }
        return new RationalReal(num,den);
    }
}

/**
 * Class RationalReal
 * represents a rational number as a reduced fraction with a positve denominator
 */
class RationalReal extends Real
{
    static zero : RationalReal;
    static one : RationalReal;

    protected num : number;
    //denominator is natural number
    protected den : number;

    constructor(num : number, den : number = 1)
    {
        super();
        if (den == 0) {
            result += "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
            result += "ich habe das jetzt mal zu einer 1 geändert...<br>";
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

    ausgeben() : string
    {
        if (this.den == 1 || this.num == 0)
            return this.num;
        return RationalReal.fractionAusgeben(this.num , this.den);
    }

    inlineAusgeben(): string
    {
        if (this.den == 1 || this.num == 0)
            return (string) this.num;
        return  this.num + '/' + this.den ;
    }

    isOne(): boolean
    {
        return this.num == this.den;
    }

    isZero(): boolean
    {
        return this.num == 0;
    }

    private simplify()
    {
        g = RationalReal.gcd(this.num,this.den);
        this.num = this.num / g;
        this.den = this.den / g;
    }

    floatValue(): number
    {
        return this.num / this.den;
    }

    equalsR(other: Real) : boolean
    {
        if (other instanceof RationalReal){
            return this.num == other.num && this.den == other.den;
        }
        return other.equalsR(this);
    }

    addR(other: Real) : Real
    {
        if (other instanceof RationalReal) {
            //ggT der Nenner
            var g = RationalReal.gcd(this.den,other.den);
            var b = this.den / g;
            var d = other.den / g;
            //this.den * d ist auch der kgV (lcm) der Nenner
            return new RationalReal(this.num * d + other.num * b, this.den * d);
        }
        else
            return new FloatReal(this.floatValue() + other.floatValue());
    }

    subtractR(other: Real) : Real
    {
        
        if (other instanceof RationalReal) {
            //ggT der Nenner
            var g = RationalReal.gcd(this.den,other.den);
            var b = this.den / g;
            var d = other.den / g;
            //this.den * d ist auch der kgV (lcm) der Nenner
            return new RationalReal(this.num * d - other.num * b, this.den * d);
        }
        else
            return new FloatReal(this.floatValue() - other.floatValue());
    }

    multiplyR(other: Real) : Real
    {
        if (other instanceof RationalReal) {
            var num = this.num * other.num;
            var den = this.den * other.den;
            return RationalReal.of(num, den);
        }
        return new FloatReal(this.floatValue() * other.floatValue());
    }

    divideByR(other: Real) : Real
    {
        if (other instanceof RationalReal) {
            var num = this.num * other.den;
            var den = this.den * other.num;
            return RationalReal.of(num, den);
        }

        return new FloatReal(this.floatValue() / other.floatValue());
    }

    negativeR(): Real
    {
        return new RationalReal(-this.num, this.den);
    }

    reciprocalR(): Real
    {
        return RationalReal.of(this.den,this.num);
    }

    ////////////////

    static of(num : number = 0, den : number = 1)
    {
        if (num == 0)
            return RationalReal.zero;
        if (num == den)
            return RationalReal.one;
        if (Number.isSafeInteger(num) && Number.isSafeInteger(den))
            return new RationalReal(num, den);
        throw "Not safe integers: " + num + ", " + den + ".";
        
    }

    static fractionAusgeben(num, den) {
        return "\\frac{" + num  + "}{"  + den + "}";
    }

    /**
     * Greatest common divisor of numbers "a" and "b"
     * @param number a only natural numbers
     * @param number b only natural numbers
     * @return number
     */
    static gcd(a : number, b : number) : number {
        var r : number;
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
    static lcm(a : number, b : number) : number {
        return (a * b) / RationalReal.gcd(a, b);
    }
}

/*
Constant.init();

class Constant extends Numeric {

    private viewName;

    protected constructor(string viewName, number re, number im){
        super(re, im);
        this.viewName = viewName;
    }

    ausgeben() {
            return "<mi> this.viewName </mi>";
    }

    /// Element-wise
    /// Static

    private static allConstants;

    static init() {
        pi = new Constant("&pi;", pi(), 0);
        self.allConstants = {
            "π" : pi,
            "pi" : pi,
            "e" : new Constant("e", 2.718281828459045235,0),
            "i" : new Constant("i",0,1)
        };
        //result += "Constant init";
    }

    static ofName(string name) {
        return self.allConstants[name};
    }

    static isConstantName(string name) {
        return array_key_exists(name, self.allConstants);
    }

}*/


