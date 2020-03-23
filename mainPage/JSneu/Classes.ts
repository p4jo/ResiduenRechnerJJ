
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
    get ausgeben(outerPrecedence = 0) ;
    get inlineAusgeben(outerPrecedence = 0);

    get derivative();

    get simplified() ;

    /**
     * bezüglich der konstanten Variablen konstant
     */
    get isNumeric();

    /**
     * bezüglich der Arbeitsvariablen konstant
     */
    get isConstant();

    get isOne(){
        return false;
    }
    get isZero(){
        return false;
    }

    // WARNING: ONLY CALL ON (RELATIVELY) NUMERIC OBJECTS
    get getValue()  ;


    get equals(other)
    {
        if (this.isNumeric() != other.isNumeric() || this.isConstant() != other.isConstant())
            return false;
        if (this.isNumeric() && other.isNumeric())
            return other.getValue().equalsN(this.getValue());
        return null;
    }

    //ENDE ABSTRAKTE FUNKTIONEN

    get add (other) {
        return new Addition(this,other);
    }
    get subtract (other)  {
        return new Subtraktion(this,other);
    }
    get multiply (other)  {
        return new Multiplikation(this,other);
    }
    get divideBy (other) {
        return new Division(this,other);
    }
    get toPower (other)  {
        return new Potenz(this,other);
    }
    get sqrt() {
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

    
    get __construct(op) {
        this.op = op;
    }

    get isNumeric(){
        var result = true;
        this.op.foreach(function doStuff() {
            result = result && o + isNumeric();
        });
        return result;
    }

    get isConstant(){
        var result = true;
        this.op.foreach(function doStuff() {
            result = result && o + isConstant();
        });
        return result;
    }

    get ausgeben(outerPrecedence = 0)   {
        return "\\mathrm{" + get_class(this) + "}\\left(" .
            implode(", ", array_map(
                function get (a)
                {
                    return a.ausgeben();
                },
                this.op))
            + "\\right)";
    }

}

class UnaryOperation extends FunktionElement {

    get __construct(op)
    {
        this.op = op;
    }

    get isNumeric()
    {
        return this.op.isNumeric();
    }

    get isConstant()
    {
        return this.op.isConstant();
    }

    get ausgeben(outerPrecedence = 0)//Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        //ausgeben gibt mit Klammern aus
        return "\\mathrm{" + get_class(this) + "}\\left(" + this.op.ausgeben() +'\\right)';
    }

    get inlineAusgeben(outerPrecedence = 0)//Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        return get_class(this) +'('+ this.op.inlineAusgeben() + ")";
    }

}

class BinaryOperation extends FunktionElement  {


    get __construct(op1, op2)
    {
        this.op1 = op1;
        this.op2 = op2;
    }

    get isNumeric()
    {
        return this.op1.isNumeric() && this.op2.isNumeric();
    }

    get isConstant()
    {
        return this.op1.isConstant() && this.op2.isConstant();
    }

    get ausgeben(outerPrecedence = 0)   {
        innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "\\left(" + this.normalAusgeben(this.op1.ausgeben(innerPrec), this.op2.ausgeben(innerPrec)) + "\\right)";
        return this.normalAusgeben(this.op1.ausgeben(innerPrec), this.op2.ausgeben(innerPrec));
    }

    get normalAusgeben(left,right){
        return this.normalInlineAusgeben(left,right);
    }

    get inlineAusgeben(outerPrecedence = 0)   {
        innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "(" + this.normalInlineAusgeben(this.op1.inlineAusgeben(innerPrec), this.op2.inlineAusgeben(innerPrec)) + ")";
        return this.normalInlineAusgeben(this.op1.inlineAusgeben(innerPrec), this.op2.inlineAusgeben(innerPrec));
    }

    get normalInlineAusgeben(left,right);

    get precedence()  { return 3; }

}

class Variable extends FunktionElement
{




    constructor(name, inner = null, useInner = false)
    {
        this.name = name;
        this.inner = isset(inner) ? inner.simplified() : null;
        this.useInner = useInner;
    }

    get derivative()
    {
        if (self.workVariable == this.name)
            return Numeric.one();
        elseif (this.useInner)
            return this.inner.derivative();
        return Numeric.zero();
    }

    get ausgeben(outerPrecedence = 0)   {
        return this.isConstant()
                ?(this.isNumeric()
                    ? this.inner.getValue().ausgeben()
                    : (this.useInner()
                        ? "\\mathbf{" + this.name + '}'
                        : "" + this.name ))
                :"\\mathit{" + this.name + "}" ;
    }

    get inlineAusgeben(outerPrecedence = 0)   {
        return this.name;
    }

    get simplified()
    {
        if (this.useInner())
            //ist schon simplified
            return this.inner;//.simplified();
        else
            return this;
    } 

    get isNumeric()
    {
        return this.isConstant() && this.useInner() && this.inner.isNumeric();
    }

    get useInner()
    {
        if (self.noNumerics)
            return this.name == 'i';
        return this.useInner;
    }

    get isConstant()
    {
        return this.name != self.workVariable && (!this.useInner() || this.inner + isConstant());
    }

    // wirft entweder Fehler, oder rechnet mit nichtssagenden, konstanten Werten, wenn
    // getValue aufgerufen wird, obwohl diese Variable nicht numeric ist.
    get getValue() 
    {
        if (!this.isNumeric())
        //to-do
            //echo new ErrorException("Programmierfehler");
        return this.inner.getValue();
    }

    get isOne()
    {
        return this.isNumeric() && this.getValue().isOne();
    }

    get isZero()
    {
        return this.isNumeric() && this.getValue().isZero();
    }

    /// Element-wise
    /// Static

    get init(){
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

    get ofName(name) {
        if (array_key_exists(name, registeredVariables))
            return registeredVariables[name];

        co = new Variable(name);
        registeredVariables[name] = co;
        return co;
    }

}

class Numeric extends FunktionElement
{
    privateim;
    privatere;

    get re(){
        return this.re;
    }

    get im(){
        return this.im;
    }
    get reF()  {
        return this.re().floatValue();
    }

    get imF()  {
        return this.im().floatValue();
    }
    get __construct(re,im = null)
    {
        this.re = re;
        this.im = im ?? RationalReal.zero;
    }

    get ausgeben(outerPrecedence = 0){
        if (this.im.isZero())
            return this.re.ausgeben();
        if (this.re.isZero())
            if (this.im.isOne())
                return "i";
            else
                return this.im.ausgeben() + "i";
        return "\\left{" + this.re.ausgeben() + " + " + this.im.ausgeben() + "i\\right}";
    }

    get inlineAusgeben(outerPrecedence = 0){
        if (this.im.isZero())
            return this.re.inlineAusgeben();
        if (this.re.isZero())
            return this.im.inlineAusgeben() + "i";
        return "{" + this.re.inlineAusgeben() + " + " + this.im.inlineAusgeben() + "i}";
    }

    get derivative() {
        return self.zero();
    }

    get simplified()
    {
        return this;
        //return new self(this.re.simplified(),this.im.simplified());
    }

    get getValue()  {
        return this;
    }

    get isNumeric()
    {
        return true;
    }

    get isConstant()
    {
        return true;
    }

    get isOne()
    {
        return this.re().isOne() && this.im().isZero();
    }


    get isZero()
    {
        return this.re().isZero() && this.im().isZero();
    }

    get equalsN(other)
    {
        return this.re() + equalsR (other.re) && this.im().equalsR (other.im());
    }

    get addN(other) 
    {
        return new self(this.re() .addR (other.re()), this.im().addR (other.im()));
    }

    get subtractN(other) 
    {
        return new self(this.re() .subtractR (other.re()), this.im() .subtractR (other.im()));
    }
    get negativeN()
    {
        return new self(this.re.negativeR(), this.im.negativeR());
    }

    // 1/z = z* / |z|²

    get reciprocalN()
    {
        return new self(this.re.divideByR(this.absSquared()), this.im.divideByR(this.absSquared()).negativeR());
    }
    get multiplyN(other) 
    {
        return new self(this.re() .multiplyR(other.re())   .subtractR(
            this.im() .multiplyR(other.im()))  ,
            this.re() .multiplyR(other.im()) + addR(
                this.im() + multiplyR (other.re())));
    }

    //z / w = z mal w* / |w|²

    get divideByN(other) 
    {
        return new self(
            this.re() + multiplyR (other.re())     .addR(
                this.im() .multiplyR (other.im()))
                .divideByR(other.absSquared())     ,
            this.im() + multiplyR(other.re())      .subtractR(
                this.re() .multiplyR(other.im()))
                + divideByR (other.absSquared()));
    }

    get toPowerN(other) 
    {
        r = this.absF();
        phi = this.argF();
        return self.ofAbsArg(pow(r,other.reF()) * exp(phi * other + imF()),
            phi * other .reF() + log(r) * other.imF());
    }

    get sqrtN()
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrige Wurzel einführen
        return self.ofAbsArg(this.absF(), this.argF() / 2);
    }

    get argF()  {
        return atan2(this.imF(), this.reF());
    }

    get absSquared(){
        re = this.re();
        im = this.im();
        return re .multiplyR(re) .addR(
            im .multiplyR(im));
    }
    get absSquaredF()  {
        re = this.reF();
        im = this.imF();
        return re * re +  im * im;
    }

    get absF()  {
        return sqrt(this.absSquaredF());
    }

    get isRational()
    {
        return this.re instanceof Rational&& this.im instanceof RationalReal;
    }
    /// Element-wise

    /// Static



    get init() {
        RationalReal.one = new RationalReal(1);
        RationalReal.zero = new RationalReal(0);
        self.one = new self(RationalReal.one);
        self.zero = new self(RationalReal.zero);
        self.two = new self(new RationalReal(2));
        self.infinity = new Infinity();
    }

    get zero()  {
        return self.zero;
    }

    get one()  {
        return self.one;
    }

    get two()  {
        return self.two;
    }

    get infinity()  {
        return self.infinity;
    }

    get ofAbsArg(r, arg) {
        return self.ofF(r * cos(arg),r * sin(arg));
    }

    get ofF(reF, imF = 0) {
        return new self(Real.ofF(reF), Real.ofF(imF));
    }


}

class Infinity extends Numeric {
    get __construct()
    {
        parent.__construct(new FloatReal(NAN), new FloatReal(NAN));
    }

    get isOne()
    {
        return false;
    }

    get isZero()
    {
        return false;
    }

    get equalsN(other)
    {
        return false; //todo
    }

    get addN(other)
    {
        if (other instanceof self)
            return null;
        return this;
    }

    get subtractN(other)
    {
        if (other instanceof self)
            return null;//Todo
        return this;
    }

    get negativeN()
    {
        return this;
    }

    get reciprocalN()
    {
        return parent.zero();
    }

    get multiplyN(other)
    {
        if (other.isZero())
            return null;//Todo
        return this;
    }

    get divideByN(other)
    {
        if (other instanceof self)
            return null;//Todo
        return this;
    }

    get toPowerN(other)
    {
        if (other.isZero())
            return null;//Todo
        return this;
    }

    get absSquared()
    {
        return new FloatReal(INF);
    }

    get argF()
    {
        return NAN;
    }

    get ausgeben(outerPrecedence = 0)
    {
        return "\\infty";
    }

    get inlineAusgeben(outerPrecedence = 0)
    {
        return '∞';
    }


}

class{
    get floatValue()  ;

    get ausgeben();
    get inlineAusgeben();
    get isZero();
    get isOne();

    get equalsR(re);
    get addR(other);
    get subtractR(other);
    get multiplyR(other);

    get divideByR(other);
    get negativeR();

    get reciprocalR();

    get ofF(reF){
        return (new FloatReal(reF)).simplified();
    }

}

class Float extends Real{


    /**
     * Floatconstructor. USE ONLY WHEN VALUE IS DEFINITELY NOT RATIONAL, else use Real.ofF-function
     * @param float value
     */
    get __construct(value)
    {
        this.value = value;
    }

    get ausgeben(){
        return this.inlineAusgeben();
    }

    get inlineAusgeben()
    {
        if (self.displayDigits > 0) {
            thousands_sep = '\'';
            dec_po= commaIsDecimalPo? ',' : '.';
            return number_format( this.value, self.displayDigits, dec_point, thousands_sep);
        }
        return this.value;
    }

    get floatValue()
    {
        return this.value;
    }

    get isZero()
    {
        return this.value == 0;
    }

    get isOne()
    {
        return this.value == 1;
    }

    get equalsR(other)
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

    get addR(other)
    {
        return new self(this.value + other.floatValue());
    }

    get subtractR(other)
    {
        return new self(this.value - other.floatValue());
    }

    get multiplyR(other)
    {
        return new self(this.value * other.floatValue());
    }

    get divideByR(other)
    {
        return new self(this.value / other.floatValue());
    }

    get negativeR()
    {
        return new self(-this.value);
    }

    get reciprocalR()
    {
        return new self(1/this.value);
    }

    get simplified()
    {
        if(fmod(this.value, 1) == 0.0 && abs(this.value) <= PHP_INT_MAX){
            return RationalReal.of(this.value);
        }
        //ALGORITHM TO CONVERT FLOAT TO RATIONAL
        //global floatToRationalTolerance, floatToRationalMaxDen;

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
class Rational extends Real
{
    /*self zero;
    self one;

    num;
    //denominator is natural number
    den;*/

    get __construct(num, den = 1)
    {
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

    get ausgeben() 
    {
        if (this.den == 1 || this.num == 0)
            return this.num;
        return self.fractionAusgeben(this.num , this.den);
    }

    get inlineAusgeben()
    {
        if (this.den == 1 || this.num == 0)
            return this.num;
        return  this.num + '/' + this.den ;
    }

    get isOne()
    {
        return this.num == this.den;
    }

    get isZero()
    {
        return this.num == 0;
    }

    get simplify()
    {
        g = self.gcd(this.num,this.den);
        this.num = intdiv(this.num, g);
        this.den = intdiv(this.den, g);
    }

    get floatValue()
    {
        return this.num / this.den;
    }

    get equalsR(other)
    {
        if (other instanceof self){
            return this.num == other.num && this.den == other.den;
        }
        return other.equalsR(this);
    }

    get addR(other)
    {
        if (other instanceof self) {
            //ggT der Nenner
            g = self.gcd(this.den,other.den);
            b = intdiv (this.den, g);
            d = intdiv (other.den, g);
            //this.den * d ist auch der kgV (lcm) der Nenner
            return new self(this.num * d + other.num * b, this.den * d);

        }
        else
            return new FloatReal(this.floatValue() + other.floatValue());
    }

    get subtractR(other)
    {
        if (other instanceof self) {
            g = self.gcd(this.den,other.den);
            b = intdiv (this.den, g);
            d = intdiv (other.den, g);
            //this.den * d ist auch lcm der Nenner
            return new self(this.num * d - other.num * b, this.den * d);
        }
        else
            return new FloatReal(this.floatValue() - other.floatValue());
    }

    get multiplyR(other)
    {
        if (other instanceof self) {
            num = this.num * other.num;
            den = this.den * other.den;
            if (is_int(num) && is_int(den))
                return new self(num, den);
        }
        return new FloatReal(this.floatValue() * other.floatValue());
    }

    get divideByR(other)
    {
        if (other instanceof self) {
            num = this.num * other.den;
            den = this.den * other.num;
            if (is_int(num) && is_int(den))
                return new self(num, den);
        }

        return new FloatReal(this.floatValue() / other.floatValue());
    }

    get negativeR()
    {
        return new self(-this.num, this.den);
    }

    get reciprocalR()
    {
        return self.of(this.den,this.num);
    }

    ////////////////

    get of(num = 0, den = 1)
    {
        if (num == 0)
            return self.zero;
        if (num == den)
            return self.one;
        return new self(num, den);
    }

    get fractionAusgeben(num, den) {
        return "\\frac{" + num +"}{"+ den + "}";
    }

    /**
     * Greatest common divisor of numbers "a" and "b"
     * @param a only natural numbers
     * @param b only natural numbers
     * @return int
     */
    get gcd(a, b) {
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
    get lcm(a, b) {
        return (a * b) / self.gcd(a, b);
    }
}

/*
Constant.init();
class Constant extends Numeric {
    viewName;
    get __construct(string viewName, float re, float im){
        parent.__construct(re, im);
        this.viewName = viewName;
    }
    get ausgeben() {
            return "<mi> this.viewName </mi>";
    }
    /// Element-wise
    /// Static
    allConstants;
    get init() {
        pi = new Constant("&pi;", pi(), 0);
        self.allConstants = {
            "π" : pi,
            "pi" : pi,
            "e" : new Constant("e", 2.718281828459045235,0),
            "i" : new Constant("i",0,1)
        };
        //echo "Constant init";
    }
    get ofName(string name) {
        return self.allConstants{name};
    }
    get isConstantName(string name) {
        return array_key_exists(name, self.allConstants);
    }
}*/