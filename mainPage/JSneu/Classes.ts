
floatToRationalTolerance = PHP_FLOAT_MIN * 0x1000000000000000000000000000000000;
floatToRationalMaxDen = 1000;

// REIHENFOLGE ESSENTIELL
Numeric.init();
Variable.init();


// TODO: Auch Operationen müssen, wie Variablen, nur zu Numerics vereinfacht werden dürfen, wenn das gewünscht ist
// (z.B. Additionen immer erlaubt (oder bei rational plus float nicht), aber Wurzel und ln nicht erlaubt, weil das in Zahlen in mathematischer Notation auch stehen bleibt

// Enter any new Operator here. By default Operators are left-grouping within their precedence class, add key
// 'rightAssociative' if meant otherwise
operations = {
    '+' : {'name' : 'Addition', 'arity' : 2, 'precedence' : 2},
    '-' : {'name' : 'Subtraktion', 'arity' : 2, 'precedence' : 2},
    '/' : {'name' : 'Division', 'arity' : 2, 'precedence' : 4},
    '÷' : {'name' : 'Division', 'arity' : 2, 'precedence' : 3},
    ':' : {'name' : 'Division', 'arity' : 2, 'precedence' : 3},
    '*' : {'name' : 'Multiplikation', 'arity' : 2, 'precedence' : 3},
    '×' : {'name' : 'Multiplikation', 'arity' : 2, 'precedence' : 3},
    '·' : {'name' : 'Multiplikation', 'arity' : 2, 'precedence' : 3},
//    '%' : {'name' : 'RestMod', 'arity' : 2, 'precedence' : 3},
    '^' : {'name' : 'Potenz', 'arity' : 2, 'precedence' : 4, 'rightAssociative' : 1},

    'sin' : {'name' : 'sin', 'arity' : 1, 'precedence' : 5},
    'cos' : {'name' : 'cos', 'arity' : 1, 'precedence' : 5},
    'ln' : {'name' : 'ln', 'arity' : 1, 'precedence' : 5},
    'sqrt' : {'name' : 'sqrt', 'arity' : 1, 'precedence' : 5},
    'Wurzel' : {'name' : 'sqrt', 'arity' : 1, 'precedence' : 5},
    'ζ' : {'name' : 'RiemannZeta', 'arity' : 1, 'precedence' : 5},
    //Pi-Funktion (entschobene Gamma-Funktion) //postfix
    '!' : { 'name' : 'Factorial', 'arity' : 1, 'precedence' : 5},
};


// ENDE ESSENTIELLE REIHENFOLGE

/**
 * Class FunktionElement: IMMUTABLE
 */
class FunktionElement {
    ausgeben(outerPrecedence = 0) ;
    inlineAusgeben(outerPrecedence = 0);

    derivative();

    simplified() ;

    /**
     * bezüglich der konstanten Variablen konstant
     */
    isNumeric();

    /**
     * bezüglich der Arbeitsvariablen konstant
     */
    isConstant();

    isOne(){
        return false;
    }
    isZero(){
        return false;
    }

    // WARNING: ONLY CALL ON (RELATIVELY) NUMERIC OBJECTS
    getValue()  ;


    equals(other)
    {
        if (this.isNumeric() != other.isNumeric() || this.isConstant() != other.isConstant())
            return false;
        if (this.isNumeric() && other.isNumeric())
            return other.getValue().equalsN(this.getValue());
        return null;
    }

    //ENDE ABSTRAKTE FUNKTIONEN

    add (other) {
        return new Addition(this,other);
    }
    subtract (other)  {
        return new Subtraktion(this,other);
    }
    multiply (other)  {
        return new Multiplikation(this,other);
    }
    divideBy (other) {
        return new Division(this,other);
    }
    toPower (other)  {
        return new Potenz(this,other);
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

    
   constructor(op) {
       super();
        this.op = op;
    }

    isNumeric(){
        var result = true;
        this.op.foreach(function doStuff() {
            result = result && o + isNumeric();
        });
        return result;
    }

    isConstant(){
        var result = true;
        this.op.foreach(function doStuff() {
            result = result && o + isConstant();
        });
        return result;
    }

    ausgeben(outerPrecedence = 0)   {
        return "\\mathrm{" + get_class(this) + "}\\left(" .
            implode(", ", array_map(
                function (a)
                {
                    return a.ausgeben();
                },
                this.op))
            + "\\right)";
    }

}

class UnaryOperation extends FunktionElement {

   constructor(op)
    {
       super();
        this.op = op;
    }

    isNumeric()
    {
        return this.op.isNumeric();
    }

    isConstant()
    {
        return this.op.isConstant();
    }

    ausgeben(outerPrecedence = 0)//Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        //ausgeben gibt mit Klammern aus
        return "\\mathrm{" + get_class(this) + "}\\left(" + this.op.ausgeben() +'\\right)';
    }

    inlineAusgeben(outerPrecedence = 0)//Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        return get_class(this) +'('+ this.op.inlineAusgeben() + ")";
    }

}

class BinaryOperation extends FunktionElement  {


   constructor(op1, op2)
    {
       super();
        this.op1 = op1;
        this.op2 = op2;
    }

    isNumeric()
    {
        return this.op1.isNumeric() && this.op2.isNumeric();
    }

    isConstant()
    {
        return this.op1.isConstant() && this.op2.isConstant();
    }

    ausgeben(outerPrecedence = 0)   {
        innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "\\left(" + this.normalAusgeben(this.op1.ausgeben(innerPrec), this.op2.ausgeben(innerPrec)) + "\\right)";
        return this.normalAusgeben(this.op1.ausgeben(innerPrec), this.op2.ausgeben(innerPrec));
    }

    normalAusgeben(left,right){
        return this.normalInlineAusgeben(left,right);
    }

    inlineAusgeben(outerPrecedence = 0)   {
        innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "(" + this.normalInlineAusgeben(this.op1.inlineAusgeben(innerPrec), this.op2.inlineAusgeben(innerPrec)) + ")";
        return this.normalInlineAusgeben(this.op1.inlineAusgeben(innerPrec), this.op2.inlineAusgeben(innerPrec));
    }

    normalInlineAusgeben(left,right);

    precedence()  { return 3; }

}

class Variable extends FunktionElement
{




    constructor(name, inner = null, useInner = false)
    {
        super();
        this.name = name;
        this.inner = isset(inner) ? inner.simplified() : null;
        this.useInner = useInner;
    }

    derivative()
    {
        if (self.workVariable == this.name)
            return Numeric.one();
        elseif (this.useInner)
            return this.inner.derivative();
        return Numeric.zero();
    }

    ausgeben(outerPrecedence = 0)   {
        return this.isConstant()
                ?(this.isNumeric()
                    ? this.inner.getValue().ausgeben()
                    : (this.useInner()
                        ? "\\mathbf{" + this.name + '}'
                        : "" + this.name ))
                :"\\mathit{" + this.name + "}" ;
    }

    inlineAusgeben(outerPrecedence = 0)   {
        return this.name;
    }

    simplified()
    {
        if (this.useInner())
            //ist schon simplified
            return this.inner;//.simplified();
        else
            return this;
    } 

    isNumeric()
    {
        return this.isConstant() && this.useInner() && this.inner.isNumeric();
    }

    useInner()
    {
        if (self.noNumerics)
            return this.name == 'i';
        return this.useInner;
    }

    isConstant()
    {
        return this.name != self.workVariable && (!this.useInner() || this.inner + isConstant());
    }

    // wirft entweder Fehler, oder rechnet mit nichtssagenden, konstanten Werten, wenn
    // getValue aufgerufen wird, obwohl diese Variable nicht numeric ist.
    getValue() 
    {
        if (!this.isNumeric())
        //to-do
            //echo new ErrorException("Programmierfehler");
        return this.inner.getValue();
    }

    isOne()
    {
        return this.isNumeric() && this.getValue().isOne();
    }

    isZero()
    {
        return this.isNumeric() && this.getValue().isZero();
    }

    /// Element-wise
    /// Static

    init(){
        //User kann hier eigene "Null-äre Operationen" eintragen, d.h. Kurzschreibweisen wie sin(3x^2), oder pi+e (vereinfachbar)
        registeredVariables = {
            'τ' : new Variable ('τ', new Numeric(new FloatReal(2*pi()))),
            'e' : new Variable ('e', new Numeric(new FloatReal(2.718281828459045235))),
            'i' : new Variable ('i', new Numeric(RationalReal.zero, RationalReal.one), true),
            'φ' : new Variable('φ', Numeric.one() + add(new sqrt(new Numeric(new RationalReal(5)))) + divideBy(Numeric.two()), true)
        };
        registeredVariables['π'] = new Variable('π', registeredVariables['τ'].divideBy(Numeric.two()), true);
        //TODO tri-Symbol zu Schrift hinzufügen
        //registeredVariables{'ш'} = new Variable('ш', registeredVariables{'τ'} .divideBy(new Numeric(new RationalReal(4),new RationalReal(0))), true);
    }

    ofName(name) {
        if (array_key_exists(name, registeredVariables))
            return registeredVariables[name];

        co = new Variable(name);
        registeredVariables[name] = co;
        return co;
    }

}

class Numeric extends FunktionElement
{
    re() {
        return this.re;
    }
    im() {
        return this.im;
    }
    reF()  {
        return this.re().floatValue();
    }

    imF()  {
        return this.im().floatValue();
    }
    
    constructor(re, im = null)
    {
        super();
        this.re = re;
        this.im = im ?? RationalReal.zero;
    }

    ausgeben(outerPrecedence = 0){
        if (this.im.isZero())
            return this.re.ausgeben();
        if (this.re.isZero())
            if (this.im.isOne())
                return "i";
            else
                return this.im.ausgeben() + "i";
        return "\\left{" + this.re.ausgeben() + " + " + this.im.ausgeben() + "i\\right}";
    }

    inlineAusgeben(outerPrecedence = 0){
        if (this.im.isZero())
            return this.re.inlineAusgeben();
        if (this.re.isZero())
            return this.im.inlineAusgeben() + "i";
        return "{" + this.re.inlineAusgeben() + " + " + this.im.inlineAusgeben() + "i}";
    }

    derivative() {
        return Numeric.zero();
    }

    simplified()
    {
        return this;
        //return new Numeric(this.re.simplified(),this.im.simplified());
    }

    getValue()  {
        return this;
    }

    isNumeric()
    {
        return true;
    }

    isConstant()
    {
        return true;
    }

    isOne()
    {
        return this.re().isOne() && this.im().isZero();
    }


    isZero()
    {
        return this.re().isZero() && this.im().isZero();
    }

    equalsN(other)
    {
        return this.re() + equalsR (other.re) && this.im().equalsR (other.im());
    }

    addN(other) 
    {
        return new Numeric(this.re() .addR (other.re()), this.im().addR (other.im()));
    }

    subtractN(other) 
    {
        return new Numeric(this.re() .subtractR (other.re()), this.im() .subtractR (other.im()));
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
    multiplyN(other) 
    {
        return new Numeric(this.re() .multiplyR(other.re())   .subtractR(
            this.im() .multiplyR(other.im()))  ,
            this.re() .multiplyR(other.im()) + addR(
                this.im() + multiplyR (other.re())));
    }

    //z / w = z mal w* / |w|²

    divideByN(other) 
    {
        return new Numeric(
            this.re() + multiplyR (other.re())     .addR(
                this.im() .multiplyR (other.im()))
                .divideByR(other.absSquared())     ,
            this.im() + multiplyR(other.re())      .subtractR(
                this.re() .multiplyR(other.im()))
                + divideByR (other.absSquared()));
    }

    toPowerN(other) 
    {
        r = this.absF();
        phi = this.argF();
        return Numeric.ofAbsArg(pow(r,other.reF()) * exp(phi * other + imF()),
            phi * other .reF() + log(r) * other.imF());
    }

    sqrtN()
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrige Wurzel einführen
        return Numeric.ofAbsArg(this.absF(), this.argF() / 2);
    }

    argF()  {
        return atan2(this.imF(), this.reF());
    }

    absSquared(){
        re = this.re();
        im = this.im();
        return re .multiplyR(re) .addR(
            im .multiplyR(im));
    }
    absSquaredF()  {
        re = this.reF();
        im = this.imF();
        return re * re +  im * im;
    }

    absF()  {
        return sqrt(this.absSquaredF());
    }

    isRational()
    {
        return this.re instanceof Rational && this.im instanceof RationalReal;
    }
    /// Element-wise

    /// Static



    init() {
        RationalReal.one = new RationalReal(1);
        RationalReal.zero = new RationalReal(0);
        Numeric.one = new Numeric(RationalReal.one);
        Numeric.zero = new Numeric(RationalReal.zero);
        Numeric.two = new Numeric(new RationalReal(2));
        Numeric.infinity = new Infinity();
    }

    zero()  {
        return Numeric.zero;
    }

    one()  {
        return Numeric.one;
    }

    two()  {
        return Numeric.two;
    }

    infinity()  {
        return Numeric.infinity;
    }

    ofAbsArg(r, arg) {
        return Numeric.ofF(r * cos(arg),r * sin(arg));
    }

    ofF(reF, imF = 0) {
        return new Numeric(Real.ofF(reF), Real.ofF(imF));
    }


}

class Infinity extends Numeric {
    constructor()
    {
        super();
        new Numeric(new FloatReal(NAN), new FloatReal(NAN));
    }

    isOne()
    {
        return false;
    }

    isZero()
    {
        return false;
    }

    equalsN(other)
    {
        return false; //todo
    }

    addN(other)
    {
        if (other instanceof Infinity)
            return null;
        return this;
    }

    subtractN(other)
    {
        if (other instanceof Infinity)
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

    multiplyN(other)
    {
        if (other.isZero())
            return null;//Todo
        return this;
    }

    divideByN(other)
    {
        if (other instanceof Infinity)
            return null;//Todo
        return this;
    }

    toPowerN(other)
    {
        if (other.isZero())
            return null;//Todo
        return this;
    }

    absSquared()
    {
        return new FloatReal(INF);
    }

    argF()
    {
        return NAN;
    }

    ausgeben(outerPrecedence = 0)
    {
        return "\\infty";
    }

    inlineAusgeben(outerPrecedence = 0)
    {
        return '∞';
    }


}

abstract class Real {
    abstract floatValue();

    abstract ausgeben();
    abstract inlineAusgeben();
    abstract isZero();
    abstract isOne();

    abstract equalsR(re);
    abstract addR(other);
    abstract subtractR(other);
    abstract multiplyR(other);

    abstract divideByR(other);
    abstract negativeR();

    abstract reciprocalR();

    ofF(reF) : Real{
        return (new FloatReal(reF)).simplified();
    }

}

class FloatReal extends Real{
    value: any;

    /**
     * FloatRealconstructor. USE ONLY WHEN VALUE IS DEFINITELY NOT RATIONAL, else use Real.ofF-function
     * @param FloatReal value
     */
    constructor(value)
    {
        super();
        this.value = value;
    }

    ausgeben(){
        return this.inlineAusgeben();
    }

    inlineAusgeben()
    {
        if (FloatReal.displayDigits > 0) {
            thousands_sep = '\'';
            dec_po= commaIsDecimalPoint ? ',' : '.';
            return number_format( this.value, FloatReal.displayDigits, dec_point, thousands_sep);
        }
        return this.value;
    }

    floatValue()
    {
        return this.value;
    }

    isZero()
    {
        return this.value == 0;
    }

    isOne()
    {
        return this.value == 1;
    }

    equalsR(other)
    {
        epsilon = PHP_FloatReal_EPSILON;
        absA = abs(this.value);
		absB = abs(other.FloatRealValue());
		diff = abs(this.value - other.FloatRealValue());

		if (this.FloatRealValue() == other.FloatRealValue()) { // shortcut, handles infinities
            return true;
        } else if (this.FloatRealValue() == 0 || other.FloatRealValue() == 0 || (absA + absB < PHP_FloatReal_MIN)) {
            // a or b is zero or both are extremely close to it
            // relative error is less meaningful here
            return diff < (epsilon * PHP_FloatReal_MIN);
        } else { // use relative error
            return diff / min((absA + absB), PHP_FloatReal_MAX) < epsilon;
        }
	}

    addR(other)
    {
        return new FloatReal(this.value + other.FloatRealValue());
    }

    subtractR(other)
    {
        return new FloatReal(this.value - other.FloatRealValue());
    }

    multiplyR(other)
    {
        return new FloatReal(this.value * other.FloatRealValue());
    }

    divideByR(other)
    {
        return new FloatReal(this.value / other.FloatRealValue());
    }

    negativeR()
    {
        return new FloatReal(-this.value);
    }

    reciprocalR()
    {
        return new FloatReal(1/this.value);
    }

    simplified()
    {
        if(fmod(this.value, 1) == 0.0 && abs(this.value) <= intmax){
            return RationalReal.of(this.value);
        }
        //ALGORITHM TO CONVERT FloatReal TO RATIONAL
        //global FloatRealToRationalTolerance, FloatRealToRationalMaxDen;

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
        while (abs(this.value - num / den) > FloatRealToRationalTolerance) {
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
            if (den > FloatRealToRationalMaxDen)
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
    static zero: RationalReal;
    static one: RationalReal;

    num: Number;
    //denominator is natural number
    den: Number;

    constructor( num, den = 1)
    {
        super();
        if (!Number.isSafeInteger(num))
        if (den == 0) {
            //TODO alert
           // echo "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
           // echo "ich habe das jetzt mal zu einer 1 geändert...<br>";
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

    ausgeben() 
    {
        if (this.den == 1 || this.num == 0)
            return this.num;
        return RationalReal.fractionAusgeben(this.num , this.den);
    }

    inlineAusgeben()
    {
        if (this.den == 1 || this.num == 0)
            return this.num;
        return  this.num + '/' + this.den ;
    }

    isOne()
    {
        return this.num == this.den;
    }

    isZero()
    {
        return this.num == 0;
    }

    simplify()
    {
        g = RationalReal.gcd(this.num,this.den);
        this.num = intdiv(this.num, g);
        this.den = intdiv(this.den, g);
    }

    floatValue()
    {
        return this.num / this.den;
    }

    equalsR(other)
    {
        if (other instanceof RationalReal){
            return this.num == other.num && this.den == other.den;
        }
        return other.equalsR(this);
    }

    addR(other)
    {
        if (other instanceof RationalReal) {
            //ggT der Nenner
            g = RationalReal.gcd(this.den,other.den);
            b = intdiv (this.den, g);
            d = intdiv (other.den, g);
            //this.den * d ist auch der kgV (lcm) der Nenner
            return new RationalReal(this.num * d + other.num * b, this.den * d);

        }
        else
            return new FloatReal(this.floatValue() + other.floatValue());
    }

    subtractR(other)
    {
        if (other instanceof RationalReal) {
            g = RationalReal.gcd(this.den,other.den);
            b = intdiv (this.den, g);
            d = intdiv (other.den, g);
            //this.den * d ist auch lcm der Nenner
            return new RationalReal(this.num * d - other.num * b, this.den * d);
        }
        else
            return new FloatReal(this.floatValue() - other.floatValue());
    }

    multiplyR(other)
    {
        if (other instanceof RationalReal) {
            num = this.num * other.num;
            den = this.den * other.den;
            if (is_int(num) && is_int(den))
                return new RationalReal(num, den);
        }
        return new FloatReal(this.floatValue() * other.floatValue());
    }

    divideByR(other)
    {
        if (other instanceof RationalReal) {
            num = this.num * other.den;
            den = this.den * other.num;
            if (is_int(num) && is_int(den))
                return new RationalReal(num, den);
        }

        return new FloatReal(this.floatValue() / other.floatValue());
    }

    negativeR()
    {
        return new RationalReal(-this.num, this.den);
    }

    reciprocalR()
    {
        return RationalReal.of(this.den,this.num);
    }

    ////////////////

    of(num = 0, den = 1)
    {
        if (num == 0)
            return RationalReal.zero;
        if (num == den)
            return RationalReal.one;
        return new RationalReal(num, den);
    }

    fractionAusgeben(num, den) {
        return "\\frac{" + num +"}{"+ den + "}";
    }

    /**
     * Greatest common divisor of numbers "a" and "b"
     * @param a only natural numbers
     * @param b only natural numbers
     * @return int
     */
    gcd(a, b) {
        do {
            r = a % b;
            a = b;
            b = r;
        } while (b > 0);
        return a;
    }

    /**
     * Least common multiple of numbers "a" and "b"
     * @param a only natural numbers
     * @param b only natural numbers
     * @return int
     */
    lcm(a, b) {
        return (a * b) / RationalReal.gcd(a, b);
    }
}

/*
Constant.init();
class Constant extends Numeric {
    viewName;
   constructor(string viewName, float re, float im){
        parent.__construct(re, im);
        this.viewName = viewName;
    }
    ausgeben() {
            return "<mi> this.viewName </mi>";
    }
    /// Element-wise
    /// Static
    allConstants;
    init() {
        pi = new Constant("&pi;", pi(), 0);
        self.allConstants = {
            "π" : pi,
            "pi" : pi,
            "e" : new Constant("e", 2.718281828459045235,0),
            "i" : new Constant("i",0,1)
        };
        //echo "Constant init";
    }
    ofName(string name) {
        return self.allConstants{name};
    }
    isConstantName(string name) {
        return array_key_exists(name, self.allConstants);
    }
}*/