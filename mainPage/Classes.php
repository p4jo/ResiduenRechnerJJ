<?php

$floatToRationalTolerance = PHP_FLOAT_MIN * 0x1000000000000000000000000000000000;
$floatToRationalMaxDen = 1000;

// REIHENFOLGE ESSENTIELL
require_once "ExplicitOperations.php";
Numeric::init();
Variable::init();


// TODO: Auch Operationen müssen, wie Variablen, nur zu Numerics vereinfacht werden dürfen, wenn das gewünscht ist
// (z.B. Additionen immer erlaubt (oder bei rational plus float nicht), aber Wurzel und ln nicht erlaubt, weil das in Zahlen in mathematischer Notation auch stehen bleibt

// Enter any new Operator here. By default Operators are left-grouping within their precedence class, add key
// 'rightAssociative' if meant otherwise
$operations = [
    '+' => ['name' => 'Addition', 'arity' => 2, 'precedence' => 2],
    '-' => ['name' => 'Subtraktion', 'arity' => 2, 'precedence' => 2],
    '/' => ['name' => 'Division', 'arity' => 2, 'precedence' => 4],
    '÷' => ['name' => 'Division', 'arity' => 2, 'precedence' => 3],
    ':' => ['name' => 'Division', 'arity' => 2, 'precedence' => 3],
    '*' => ['name' => 'Multiplikation', 'arity' => 2, 'precedence' => 3],
    '×' => ['name' => 'Multiplikation', 'arity' => 2, 'precedence' => 3],
    '·' => ['name' => 'Multiplikation', 'arity' => 2, 'precedence' => 3],
//    '%' => ['name' => 'RestMod', 'arity' => 2, 'precedence' => 3],
    '^' => ['name' => 'Potenz', 'arity' => 2, 'precedence' => 4, 'rightAssociative' => 1],

    'sin' => ['name' => 'sin', 'arity' => 1, 'precedence' => 5],
    'cos' => ['name' => 'cos', 'arity' => 1, 'precedence' => 5],
    'ln' => ['name' => 'ln', 'arity' => 1, 'precedence' => 5],
    'sqrt' => ['name' => 'sqrt', 'arity' => 1, 'precedence' => 5],
    'Wurzel' => ['name' => 'sqrt', 'arity' => 1, 'precedence' => 5],
    'ζ' => ['name' => 'RiemannZeta', 'arity' => 1, 'precedence' => 5],
    //Pi-Funktion (entschobene Gamma-Funktion) //postfix
    '!' => [ 'name' => 'Factorial', 'arity' => 1, 'precedence' => 5],
];


// ENDE ESSENTIELLE REIHENFOLGE
require_once "EntireFunktion.php";

/**
 * Class FunktionElement: IMMUTABLE
 */
abstract class FunktionElement {
    public abstract function ausgeben(int $outerPrecedence = 0) : string;
    public abstract function inlineAusgeben(int $outerPrecedence = 0): string;

    public abstract function derivative() : FunktionElement;

    public abstract function simplified() : FunktionElement ;

    /**
     * bezüglich der konstanten Variablen konstant
     */
    public abstract function isNumeric() : bool ;

    /**
     * bezüglich der Arbeitsvariablen konstant
     */
    public abstract function isConstant() : bool ;

    public function isOne() : bool {
        return false;
    }
    public function isZero() : bool {
        return false;
    }

    // WARNING: ONLY CALL ON (RELATIVELY) NUMERIC OBJECTS
    public abstract function getValue() : Numeric ;


    public function equals(FunktionElement $other) : ?bool
    {
        if ($this->isNumeric() != $other->isNumeric() || $this->isConstant() != $other->isConstant())
            return false;
        if ($this->isNumeric() && $other->isNumeric())
            return $other->getValue()->equalsN($this->getValue());
        return null;
    }

    //ENDE ABSTRAKTE FUNKTIONEN

    public function add (FunktionElement $other) : Addition {
        return new Addition($this,$other);
    }
    public function subtract (FunktionElement $other) : Subtraktion {
        return new Subtraktion($this,$other);
    }
    public function multiply (FunktionElement $other) : Multiplikation {
        return new Multiplikation($this,$other);
    }
    public function divideBy (FunktionElement $other) : Division {
        return new Division($this,$other);
    }
    public function toPower (FunktionElement $other) : Potenz {
        return new Potenz($this,$other);
    }
    public function sqrt() : sqrt {
        return new sqrt($this);
    }


}

/**
 * Alle Funktionen sollten als Unterklassen von den Operation - Klassen definiert werden,
 * sie können simplify und müssen ableiten überschreiben, statische Funktionen sollten nicht
 * und ausgeben muss nicht überschrieben werden.
 * Jeder Operator und jede Funktion muss in operations eingetragen werden.
 */
abstract class Operation extends FunktionElement {

    protected array $op;

    public function __construct(FunktionElement ... $op) {
        $this->op = $op;
    }

    public function isNumeric() : bool {
        $result = true;
        foreach ($this->op as $o)
        {
            $result = $result && $o -> isNumeric();
        }
        return $result;
    }

    public function isConstant() : bool {
        $result = true;
        foreach ($this->op as $o)
        {
            $result = $result && $o -> isConstant();
        }
        return $result;
    }

    public function ausgeben(int $outerPrecedence = 0) : string    {
        return "\\mathrm{" . get_class($this) . "}\\left(" .
            implode(", ", array_map(
                function (FunktionElement $a)
                {
                    return $a->ausgeben();
                },
                $this->op))
            . "\\right)";
    }

}

abstract class UnaryOperation extends FunktionElement {

    protected FunktionElement $op;
    public function __construct(FunktionElement $op)
    {
        $this->op = $op;
    }

    public function isNumeric(): bool
    {
        return $this->op->isNumeric();
    }

    public function isConstant(): bool
    {
        return $this->op->isConstant();
    }

    public function ausgeben(int $outerPrecedence = 0) : string //Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        //ausgeben gibt mit Klammern aus
        return "\\mathrm{" . get_class($this) . "}\\left(" . $this->op->ausgeben() .'\\right)';
    }

    public function inlineAusgeben(int $outerPrecedence = 0) : string //Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        return get_class($this) .'('. $this->op->inlineAusgeben() . ")";
    }

}

abstract class BinaryOperation extends FunktionElement  {

    public FunktionElement $op1, $op2;

    public function __construct(FunktionElement $op1, FunktionElement $op2)
    {
        $this->op1 = $op1;
        $this->op2 = $op2;
    }

    public function isNumeric(): bool
    {
        return $this->op1->isNumeric() && $this->op2->isNumeric();
    }

    public function isConstant(): bool
    {
        return $this->op1->isConstant() && $this->op2->isConstant();
    }

    public function ausgeben(int $outerPrecedence = 0) : string    {
        $innerPrec = $this->precedence();
        if ($outerPrecedence > $innerPrec)
            return "\\left(" . $this->normalAusgeben($this->op1->ausgeben($innerPrec), $this->op2->ausgeben($innerPrec)) . "\\right)";
        return $this->normalAusgeben($this->op1->ausgeben($innerPrec), $this->op2->ausgeben($innerPrec));
    }

    public function normalAusgeben($left,$right){
        return $this->normalInlineAusgeben($left,$right);
    }

    public function inlineAusgeben(int $outerPrecedence = 0) : string    {
        $innerPrec = $this->precedence();
        if ($outerPrecedence > $innerPrec)
            return "(" . $this->normalInlineAusgeben($this->op1->inlineAusgeben($innerPrec), $this->op2->inlineAusgeben($innerPrec)) . ")";
        return $this->normalInlineAusgeben($this->op1->inlineAusgeben($innerPrec), $this->op2->inlineAusgeben($innerPrec));
    }

    public abstract function normalInlineAusgeben($left,$right);

    function precedence() : int { return 3; }

}

class Variable extends FunktionElement
{
    public static bool $noNumerics = false;
    public static string $workVariable = '';

    public string $name;
    public ?FunktionElement $inner;
    public bool $useInner = false;

    private function __construct(string $name, FunktionElement $inner = null, bool $useInner = false)
    {
        $this->name = $name;
        $this->inner = isset($inner) ? $inner->simplified() : null;
        $this->useInner = $useInner;
    }

    public function derivative() : FunktionElement
    {
        if (self::$workVariable == $this->name)
            return Numeric::one();
        elseif ($this->useInner)
            return $this->inner->derivative();
        return Numeric::zero();
    }

    public function ausgeben(int $outerPrecedence = 0) : string    {
        return $this->isConstant()
                ?($this->isNumeric()
                    ? $this->inner->getValue()->ausgeben()
                    : ($this->useInner()
                        ? "\\mathbf{" . $this->name . '}'
                        : "" . $this->name ))
                :"\\mathit{" . $this->name . "}" ;
    }

    public function inlineAusgeben(int $outerPrecedence = 0) : string    {
        return $this->name;
    }

    public function simplified() : FunktionElement
    {
        if ($this->useInner())
            //ist schon simplified
            return $this->inner;//->simplified();
        else
            return $this;
    } 

    public function isNumeric(): bool
    {
        return $this->isConstant() && $this->useInner() && $this->inner->isNumeric();
    }

    public function useInner(): bool
    {
        if (self::$noNumerics)
            return $this->name == 'i';
        return $this->useInner;
    }

    public function isConstant(): bool
    {
        return $this->name != self::$workVariable && (!$this->useInner() || $this->inner -> isConstant());
    }

    // wirft entweder Fehler, oder rechnet mit nichtssagenden, konstanten Werten, wenn
    // getValue aufgerufen wird, obwohl diese Variable nicht numeric ist.
    public function getValue() : Numeric
    {
        if (!$this->isNumeric())
            echo new ErrorException("Programmierfehler");
        return $this->inner->getValue();
    }

    public function isOne(): bool
    {
        return $this->isNumeric() && $this->getValue()->isOne();
    }

    public function isZero(): bool
    {
        return $this->isNumeric() && $this->getValue()->isZero();
    }

    /// Element-wise
    /// Static

    public static function init(){
        global $registeredVariables;
        //User kann hier eigene "Null-äre Operationen" eintragen, d.h. Kurzschreibweisen wie sin(3x^2), oder pi+e (vereinfachbar)
        $registeredVariables = [
            'τ' => new Variable ('τ', new Numeric(new FloatReal(2*pi()))),
            'e' => new Variable ('e', new Numeric(new FloatReal(2.718281828459045235))),
            'i' => new Variable ('i', new Numeric(RationalReal::$zero, RationalReal::$one), true),
            'φ' => new Variable('φ', Numeric::one() -> add(new sqrt(new Numeric(new RationalReal(5)))) -> divideBy(Numeric::two()), true)
        ];
        $registeredVariables['π'] = new Variable('π', $registeredVariables['τ']->divideBy(Numeric::two()), true);
        //TODO tri-Symbol zu Schrift hinzufügen
        $registeredVariables['ш'] = new Variable('ш', $registeredVariables['τ'] ->divideBy(new Numeric(new RationalReal(4),new RationalReal(0))), true);
    }

    public static function ofName($name) : FunktionElement
    {
        global $registeredVariables;
        if (array_key_exists($name, $registeredVariables))
            return $registeredVariables[$name];

        $co = new Variable($name);
        $registeredVariables[$name] = $co;
        return $co;
    }

}

class Numeric extends FunktionElement
{
    private Real $im;
    private Real $re;

    public function re() : Real {
        return $this->re;
    }

    public function im() : Real {
        return $this->im;
    }
    public function reF() : float {
        return $this->re()->floatValue();
    }

    public function imF() : float {
        return $this->im()->floatValue();
    }
    public function __construct(Real $re, Real $im = null)
    {
        $this->re = $re;
        $this->im = $im ?? RationalReal::$zero;
    }

    public function ausgeben(int $outerPrecedence = 0) : string {
        if ($this->im->isZero())
            return $this->re->ausgeben();
        if ($this->re->isZero())
            if ($this->im->isOne())
                return "i";
            else
                return $this->im->ausgeben() . "i";
        return "\\left[" . $this->re->ausgeben() . " + " . $this->im->ausgeben() . "i\\right]";
    }

    public function inlineAusgeben(int $outerPrecedence = 0) : string {
        if ($this->im->isZero())
            return $this->re->inlineAusgeben();
        if ($this->re->isZero())
            return $this->im->inlineAusgeben() . "i";
        return "[" . $this->re->inlineAusgeben() . " + " . $this->im->inlineAusgeben() . "i]";
    }

    public function derivative() : FunktionElement {
        return self::zero();
    }

    public function simplified(): FunktionElement
    {
        return $this;
        //return new self($this->re->simplified(),$this->im->simplified());
    }

    public function getValue() : Numeric {
        return $this;
    }

    public function isNumeric(): bool
    {
        return true;
    }

    public function isConstant(): bool
    {
        return true;
    }

    public function isOne(): bool
    {
        return $this->re()->isOne() && $this->im()->isZero();
    }


    public function isZero(): bool
    {
        return $this->re()->isZero() && $this->im()->isZero();
    }

    public function equalsN(Numeric $other)
    {
        return $this->re() -> equalsR ($other->re) && $this->im()->equalsR ($other->im());
    }

    public function addN(Numeric $other) : Numeric
    {
        return new self($this->re() ->addR ($other->re()), $this->im()->addR ($other->im()));
    }

    public function subtractN(Numeric $other) : Numeric
    {
        return new self($this->re() ->subtractR ($other->re()), $this->im() ->subtractR ($other->im()));
    }
    public function negativeN()
    {
        return new self($this->re->negativeR(), $this->im->negativeR());
    }

    // 1/z = z* / |z|²

    public function reciprocalN()
    {
        return new self($this->re->divideByR($this->absSquared()), $this->im->divideByR($this->absSquared())->negativeR());
    }
    public function multiplyN(Numeric $other) : Numeric
    {
        return new self($this->re() ->multiplyR($other->re())   ->subtractR(
            $this->im() ->multiplyR($other->im()))  ,
            $this->re() ->multiplyR($other->im()) -> addR(
                $this->im() -> multiplyR ($other->re())));
    }

    //z / w = z mal w* / |w|²

    public function divideByN(Numeric $other) : Numeric
    {
        return new self(
            $this->re() -> multiplyR ($other->re())     ->addR(
                $this->im() ->multiplyR ($other->im()))
                ->divideByR($other->absSquared())     ,
            $this->im() -> multiplyR($other->re())      ->subtractR(
                $this->re() ->multiplyR($other->im()))
                -> divideByR ($other->absSquared()));
    }

    public function toPowerN(Numeric $other) : Numeric
    {
        $r = $this->absF();
        $phi = $this->argF();
        return self::ofAbsArg(pow($r,$other->reF()) * exp($phi * $other -> imF()),
            $phi * $other ->reF() + log($r) * $other->imF());
    }

    public function sqrtN()
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrige Wurzel einführen
        return self::ofAbsArg($this->absF(), $this->argF() / 2);
    }

    public function argF() : float {
        return atan2($this->imF(), $this->reF());
    }

    public function absSquared() : Real {
        $re = $this->re();
        $im = $this->im();
        return $re ->multiplyR($re) ->addR(
            $im ->multiplyR($im));
    }
    public function absSquaredF() : float {
        $re = $this->reF();
        $im = $this->imF();
        return $re * $re +  $im * $im;
    }

    public function absF() : float {
        return sqrt($this->absSquaredF());
    }

    public function isRational(): bool
    {
        return $this->re instanceof RationalReal && $this->im instanceof RationalReal;
    }
    /// Element-wise

    /// Static

    protected static Numeric $zero;
    protected static Numeric $one;
    protected static Numeric $two;
    protected static Numeric $infinity;

    public static function init() {
        RationalReal::$one = new RationalReal(1);
        RationalReal::$zero = new RationalReal(0);
        self::$one = new self(RationalReal::$one);
        self::$zero = new self(RationalReal::$zero);
        self::$two = new self(new RationalReal(2));
        self::$infinity = new Infinity();
    }

    public static function zero() : Numeric {
        return self::$zero;
    }

    public static function one() : Numeric {
        return self::$one;
    }

    public static function two() : Numeric {
        return self::$two;
    }

    public static function infinity() : Numeric {
        return self::$infinity;
    }

    public static function ofAbsArg(float $r, float $arg) {
        return self::ofF($r * cos($arg),$r * sin($arg));
    }

    public static function ofF(float $reF, float $imF = 0) : self {
        return new self(Real::ofF($reF), Real::ofF($imF));
    }


}

class Infinity extends Numeric {
    protected function __construct()
    {
        parent::__construct(new FloatReal(NAN), new FloatReal(NAN));
    }

    public function isOne(): bool
    {
        return false;
    }

    public function isZero(): bool
    {
        return false;
    }

    public function equalsN(Numeric $other)
    {
        return false; //todo
    }

    public function addN(Numeric $other): Numeric
    {
        if ($other instanceof self)
            return null;
        return $this;
    }

    public function subtractN(Numeric $other): Numeric
    {
        if ($other instanceof self)
            return null;//Todo
        return $this;
    }

    public function negativeN()
    {
        return $this;
    }

    public function reciprocalN()
    {
        return parent::zero();
    }

    public function multiplyN(Numeric $other): Numeric
    {
        if ($other->isZero())
            return null;//Todo
        return $this;
    }

    public function divideByN(Numeric $other): Numeric
    {
        if ($other instanceof self)
            return null;//Todo
        return $this;
    }

    public function toPowerN(Numeric $other): Numeric
    {
        if ($other->isZero())
            return null;//Todo
        return $this;
    }

    public function absSquared(): Real
    {
        return new FloatReal(INF);
    }

    public function argF(): float
    {
        return NAN;
    }

    public function ausgeben(int $outerPrecedence = 0): string
    {
        return "\\infty";
    }

    public function inlineAusgeben(int $outerPrecedence = 0): string
    {
        return '∞';
    }


}

abstract class Real {
    public abstract function floatValue() : float ;

    public abstract function ausgeben() : string ;
    public abstract function inlineAusgeben() : string ;
    public abstract function isZero() : bool ;
    public abstract function isOne() : bool ;

    public abstract function equalsR(Real $re) : bool;
    public abstract function addR(Real $other) : Real ;
    public abstract function subtractR(Real $other) : Real ;
    public abstract function multiplyR(Real $other) : Real ;

    public abstract function divideByR(Real $other) : Real ;
    public abstract function negativeR() : Real ;

    public abstract function reciprocalR() : Real ;

    public static function ofF(float $reF){
        return (new FloatReal($reF))->simplified();
    }

}

class FloatReal extends Real{
    public static int $displayDigits = 30;
    public float $value = 0.0;

    /**
     * FloatReal constructor. USE ONLY WHEN VALUE IS DEFINITELY NOT RATIONAL, else use Real::ofF-function
     * @param float $value
     */
    public function __construct(float $value)
    {
        $this->value = $value;
    }

    public function ausgeben() : string {
        return $this->inlineAusgeben();
    }

    public function inlineAusgeben(): string
    {
        global $commaIsDecimalPoint;
        if (self::$displayDigits > 0) {
            $thousands_sep = '\'';
            $dec_point = $commaIsDecimalPoint ? ',' : '.';
            return number_format( $this->value, self::$displayDigits, $dec_point, $thousands_sep);
        }
        return $this->value;
    }

    function floatValue(): float
    {
        return $this->value;
    }

    function isZero(): bool
    {
        return $this->value == 0;
    }

    function isOne(): bool
    {
        return $this->value == 1;
    }

    public function equalsR(Real $other) : bool
    {
        $epsilon = PHP_FLOAT_EPSILON;
        $absA = abs($this->value);
		$absB = abs($other->floatValue());
		$diff = abs($this->value - $other->floatValue());

		if ($this->floatValue() == $other->floatValue()) { // shortcut, handles infinities
            return true;
        } else if ($this->floatValue() == 0 || $other->floatValue() == 0 || ($absA + $absB < PHP_FLOAT_MIN)) {
            // a or b is zero or both are extremely close to it
            // relative error is less meaningful here
            return $diff < ($epsilon * PHP_FLOAT_MIN);
        } else { // use relative error
            return $diff / min(($absA + $absB), PHP_FLOAT_MAX) < $epsilon;
        }
	}

    public function addR(Real $other) : Real
    {
        return new self($this->value + $other->floatValue());
    }

    public function subtractR(Real $other) : Real
    {
        return new self($this->value - $other->floatValue());
    }

    public function multiplyR(Real $other) : Real
    {
        return new self($this->value * $other->floatValue());
    }

    public function divideByR(Real $other) : Real
    {
        return new self($this->value / $other->floatValue());
    }

    public function negativeR() : Real
    {
        return new self(-$this->value);
    }

    public function reciprocalR(): Real
    {
        return new self(1/$this->value);
    }

    public function simplified(): Real
    {
        if(fmod($this->value, 1) == 0.0 && abs($this->value) <= PHP_INT_MAX){
            return RationalReal::of((int) $this->value);
        }
        //ALGORITHM TO CONVERT FLOAT TO RATIONAL
        global $floatToRationalTolerance, $floatToRationalMaxDen;

        //Vorkommastellen
        $vks = floor($this->value);
        //Nachkommastellen (jetztiger / letzter)
        $nks = $this->value - $vks;
        //jetztiger / letzter , d.h. erster Bruch ist einfach der Ganzzahlteil der Zahl/1
        $num = $vks;
        $den = 1;
        //letzter / vorletzter , d.h. "vorerster Bruch 1/0"
        $oldNum = 1;
        $oldDen = 0;
        while (abs($this->value - $num / $den) > $floatToRationalTolerance) {
            $zahl = 1 / $nks;
            $vks = floor($zahl);
            $nks = $zahl - $vks;

            //Zähler und Nenner auf vks mal den letzten, plus den vorletzten (Z|N) setzen
            $temp = $num;
            $num = $vks * $num + $oldNum;
            $oldNum = $temp;

            $temp = $den;
            $den = $vks * $den + $oldDen;
            $oldDen = $temp;

            //Abbrechen bei zu großem Nenner
            if ($den > $floatToRationalMaxDen)
                return $this;
        }
        return new RationalReal($num,$den);
    }
}

/**
 * Class RationalReal
 * represents a rational number as a reduced fraction with a positve denominator
 */
class RationalReal extends Real
{
    public static self $zero;
    public static self $one;

    protected int $num;
    //denominator is natural number
    protected int $den;

    public function __construct(int $num, int $den = 1)
    {
        if ($den == 0) {
            echo "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
            echo "ich habe das jetzt mal zu einer 1 geändert...<br>";
            $den = 1;
        }

        if ($den < 0) {
            $this->den = -$den;
            $this->num = -$num;
        }
        else {
            $this->num = $num;
            $this->den = $den;
        }

        $this->simplify();
    }

    public function ausgeben() : string
    {
        if ($this->den == 1 || $this->num == 0)
            return $this->num;
        return self::fractionAusgeben($this->num , $this->den);
    }

    public function inlineAusgeben(): string
    {
        if ($this->den == 1 || $this->num == 0)
            return (string) $this->num;
        return  $this->num . '/' . $this->den ;
    }

    public function isOne(): bool
    {
        return $this->num == $this->den;
    }

    public function isZero(): bool
    {
        return $this->num == 0;
    }

    private function simplify()
    {
        $g = self::gcd($this->num,$this->den);
        $this->num = intdiv($this->num, $g);
        $this->den = intdiv($this->den, $g);
    }

    public function floatValue(): float
    {
        return $this->num / $this->den;
    }

    public function equalsR(Real $other) : bool
    {
        if ($other instanceof self){
            return $this->num == $other->num && $this->den == $other->den;
        }
        return $other->equalsR($this);
    }

    public function addR(Real $other) : Real
    {
        if ($other instanceof self) {
            //ggT der Nenner
            $g = self::gcd($this->den,$other->den);
            $b = intdiv ($this->den, $g);
            $d = intdiv ($other->den, $g);
            //$this->den * $d ist auch der kgV (lcm) der Nenner
            return new self($this->num * $d + $other->num * $b, $this->den * $d);

        }
        else
            return new FloatReal($this->floatValue() + $other->floatValue());
    }

    public function subtractR(Real $other) : Real
    {
        if ($other instanceof self) {
            $g = self::gcd($this->den,$other->den);
            $b = intdiv ($this->den, $g);
            $d = intdiv ($other->den, $g);
            //$this->den * $d ist auch lcm der Nenner
            return new self($this->num * $d - $other->num * $b, $this->den * $d);
        }
        else
            return new FloatReal($this->floatValue() - $other->floatValue());
    }

    public function multiplyR(Real $other) : Real
    {
        if ($other instanceof self) {
            $num = $this->num * $other->num;
            $den = $this->den * $other->den;
            if (is_int($num) && is_int($den))
                return new self($num, $den);
        }
        return new FloatReal($this->floatValue() * $other->floatValue());
    }

    public function divideByR(Real $other) : Real
    {
        if ($other instanceof self) {
            $num = $this->num * $other->den;
            $den = $this->den * $other->num;
            if (is_int($num) && is_int($den))
                return new self($num, $den);
        }

        return new FloatReal($this->floatValue() / $other->floatValue());
    }

    public function negativeR(): Real
    {
        return new self(-$this->num, $this->den);
    }

    public function reciprocalR(): Real
    {
        return self::of($this->den,$this->num);
    }

    ////////////////

    public static function of(int $num = 0, int $den = 1)
    {
        if ($num == 0)
            return self::$zero;
        if ($num == $den)
            return self::$one;
        return new self($num, $den);
    }

    public static function fractionAusgeben(string $num,string $den) {
        return "\\frac{" . $num ."}{". $den . "}";
    }

    /**
     * Greatest common divisor of numbers "a" and "b"
     * @param int $a only natural numbers
     * @param int $b only natural numbers
     * @return int
     */
    public static function gcd(int $a, int $b) : int{
        do {
            $r = $a % $b;
            $a = $b;
            $b = $r;
        } while ($b > 0);
        return $a;
    }

    /**
     * Least common multiple of numbers "a" and "b"
     * @param int $a only natural numbers
     * @param int $b only natural numbers
     * @return int
     */
    public static function lcm(int $a, int $b) : int{
        return ($a * $b) / self::gcd($a, $b);
    }
}

/*
Constant::init();

class Constant extends Numeric {

    private $viewName;

    protected function __construct(string $viewName, float $re, float $im){
        parent::__construct($re, $im);
        $this->viewName = $viewName;
    }

    public function ausgeben() {
            return "<mi> $this->viewName </mi>";
    }

    /// Element-wise
    /// Static

    private static $allConstants;

    public static function init() {
        $pi = new Constant("&pi;", pi(), 0);
        self::$allConstants = [
            "π" => $pi,
            "pi" => $pi,
            "e" => new Constant("e", 2.718281828459045235,0),
            "i" => new Constant("i",0,1)
        ];
        //echo "Constant init";
    }

    public static function ofName(string $name) {
        return self::$allConstants[$name];
    }

    public static function isConstantName(string $name) {
        return array_key_exists($name, self::$allConstants);
    }

}*/


