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
        this.im = im ?? Real.zero;
    }

    display(outerPrecendence : number = 0) : string {
        if (this.im.isZero())
            return this.re.display();
        if (this.re.isZero())
            if (this.im.isOne())
                return "i";
            else
                return this.im.display() + "i";
        return "\\left[" + this.re.display() + " + " + this.im.display() + "i\\right]";
    }

    displayInline(outerPrecendence : number = 0) : string {
        if (this.im.isZero())
            return this.re.displayInline();
        if (this.re.isZero())
            return this.im.displayInline() + "i";
        return "[" + this.re.displayInline() + " + " + this.im.displayInline() + "i]";
    }

    derivative() : FunktionElement {
        return Numeric.zero;
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
        return this.re.equalsR (other.re) && this.im.equalsR (other.im);
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
            this.re .multiplyR(other.im) . addR(
                this.im.multiplyR (other.re)));
    }

    //z / w = z mal w* / |w|²

    divideByN(other : Numeric) : Numeric
    {
        return new Numeric(
            this.re . multiplyR (other.re)     .addR(
                this.im .multiplyR (other.im))
                .divideByR(other.absSquared())     ,
            this.im . multiplyR(other.re)      .subtractR(
                this.re .multiplyR(other.im))
                . divideByR (other.absSquared()));
    }

    toPowerN(other : Numeric) : Numeric
    {
        var r = this.absF();
        var φ = this.argF();
        return Numeric.ofAbsArg(Math.pow(r, other.reF()) * Math.exp(φ * other.imF()),
            φ * other.reF() + Math.log(r) * other.imF());
    }

    sqrtN()
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrige Wurzel einführen
        return Numeric.ofAbsArg(Math.sqrt(this.absF()), this.argF() / 2);
    }

    argF() : number {
        return Math.atan2(this.imF(), this.reF());
    }

    absSquared() : Real {
        return this.re .multiplyR(this.re) .addR(
            this.im .multiplyR(this.im));
    }
    absSquaredF() : number {
        var re = this.reF();
        var im = this.imF();
        return re * re +  im * im;
    }

    absF() : number {
        return Math.sqrt(this.absSquaredF());
    }

    isRational(): boolean
    {
        return this.re instanceof RationalReal && this.im instanceof RationalReal;
    }
    /// Element-wise

    /// Static

    public static zero : Numeric;
    public static one : Numeric;
    public static two : Numeric;
    public static infinity : Numeric;

    static init() {
        Real.one = new RationalReal(1);
        Real.zero = new RationalReal(0);
        Numeric.one = new Numeric(Real.one);
        Numeric.zero = new Numeric(Real.zero);
        Numeric.two = new Numeric(new RationalReal(2));
        Numeric.infinity = new InfinityNumeric();
    }

    static ofAbsArg(r : number, arg : number) {
        return Numeric.ofF(r * Math.cos(arg), r * Math.sin(arg));
    }

    static ofF(reF : number, imF : number = 0) : Numeric {
        return new Numeric(Real.ofF(reF), Real.ofF(imF));
    }


}

class InfinityNumeric extends Numeric {
    constructor()
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
        if (other instanceof InfinityNumeric)
            return null;
        return this;
    }

    subtractN(other : Numeric): Numeric
    {
        if (other instanceof InfinityNumeric)
            return null;//Todo
        return this;
    }

    negativeN()
    {
        return this;
    }

    reciprocalN()
    {
        return Numeric.zero;
    }

    multiplyN(other : Numeric): Numeric
    {
        if (other.isZero())
            return null;//Todo
        return this;
    }

    divideByN(other : Numeric): Numeric
    {
        if (other instanceof InfinityNumeric)
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
        return new FloatReal(Infinity);
    }

    argF(): number
    {
        return NaN;
    }

    display(outerPrecendence : number = 0): string
    {
        return "\\infty";
    }

    displayInline(outerPrecendence : number = 0): string
    {
        return '∞';
    }


}

abstract class Real {
    abstract floatValue() : number ;

    abstract display() : string ;
    abstract displayInline() : string ;
    abstract isZero() : boolean ;
    abstract isOne() : boolean ;

    abstract equalsR(re : Real) : boolean;
    abstract addR(other: Real) : Real ;
    abstract subtractR(other: Real) : Real ;
    abstract multiplyR(other: Real) : Real ;

    abstract divideByR(other: Real) : Real ;
    abstract negativeR() : Real ;

    abstract reciprocalR() : Real ;

    static zero : RationalReal;
    static one : RationalReal;

    /**
     * Returns new Real number. If it is very close to a rational number with limited denominator it is simplified to a RationalReal
     */
    static ofF(reF : number){
        
        //ALGORITHM TO CONVERT FLOAT TO RATIONAL

        let zahl : number = reF, vks : number, nks : number, num : number = 1, den : number = 0, oldNum : number = 0, oldDen : number = 1;
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
        }  while (Math.abs(reF - num / den) > floatToRationalTolerance)
        return RationalReal.of(num,den);
    }

}

class FloatReal extends Real{
    value : number = 0.0;

    /**
     * FloatReal constructor. USE ONLY WHEN VALUE IS DEFINITELY NOT RATIONAL, else use Real.ofF-function
     */
    constructor(value : number)
    {
        super();
        this.value = value;
    }

    display() : string {
        return this.displayInline();
    }

    displayInline(): string
    {
        if (displayDigits > 0) {
            
            let thousands_sep = commaIsDecimalPoint ? '\'' : ',';
            let dec_point = commaIsDecimalPoint ? ',' : '.';
            return number_format( this.value, displayDigits, dec_point, thousands_sep);
            
            //return this.value.toLocaleString(commaIsDecimalPoint ?  'de-de' : 'en-us', {minimumFractionDigits: 0, maximumFractionDigits: displayDigits});
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
        var epsilon = Number.EPSILON;
        var absA = Math.abs(this.value);
        var absB = Math.abs(other.floatValue());
        var	diff = Math.abs(this.value - other.floatValue());

		if (this.floatValue() == other.floatValue()) { // shortcut, handles infinities
            return true;
        } else if (this.floatValue() == 0 || other.floatValue() == 0 || (absA + absB < Number.MIN_VALUE)) {
            // a or b is zero or both are extremely close to it
            // relative error is less meaningful here
            return diff < Number.MIN_VALUE;
        } else { // use relative error
            return diff / Math.min((absA + absB), Number.MAX_VALUE) < epsilon;
        }
	}

    addR(other: Real) : Real
    {
        return Real.ofF(this.value + other.floatValue());
    }

    subtractR(other: Real) : Real
    {
        return Real.ofF(this.value - other.floatValue());
    }

    multiplyR(other: Real) : Real
    {
        return Real.ofF(this.value * other.floatValue());
    }

    divideByR(other: Real) : Real
    {
        return Real.ofF(this.value / other.floatValue());
    }

    negativeR() : Real
    {
        return new FloatReal(-this.value);
    }

    reciprocalR(): Real
    {
        return new FloatReal(1/this.value);
    }

}

/**
 * Class RationalReal
 * represents a rational number as a reduced fraction with a positve denominator
 */
class RationalReal extends Real
{
    readonly num : number;
    //denominator is natural number
    readonly den : number;

    constructor(num : number, den : number = 1) {
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

        
        let g = RationalReal.gcd(this.num,this.den);
        this.num /= g;
        this.den /= g;
        
        if (!Number.isSafeInteger(this.num) || !Number.isSafeInteger(this.den))
            throw "MADE Not safe integers: " + this.num + ", " + this.den + "." ;
    }

    display() : string
    {
        if (this.den == 1 || this.num == 0)
            return this.num.toString();
        return RationalReal.fractionAusgeben(this.num, this.den);
    }

    displayInline(): string
    {
        if (this.den == 1 || this.num == 0)
            return this.num.toString();
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
        return Real.ofF(this.floatValue() + other.floatValue());
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
        return Real.ofF(this.floatValue() - other.floatValue());
    }

    multiplyR(other: Real) : Real
    {
        if (other instanceof RationalReal) {
            var num = this.num * other.num;
            var den = this.den * other.den;
            return RationalReal.of(num, den);
        }
        return Real.ofF(this.floatValue() * other.floatValue());
    }

    divideByR(other: Real) : Real
    {
        if (other instanceof RationalReal) {
            var num = this.num * other.den;
            var den = this.den * other.num;
            return RationalReal.of(num, den);
        }

        return Real.ofF(this.floatValue() / other.floatValue());
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
            return Real.zero;
        if (num == den)
            return Real.one;
        return new RationalReal(num, den);    
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
        
        if(a * b == 0)
            return 1;
        a = Math.abs(a);
        b = Math.abs(b);

        do {
            [a, b] = [b, a % b];
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

Numeric.init();