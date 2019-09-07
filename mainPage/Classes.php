<?php

require_once "ExplicitOperations.php";
require_once "EntireFunktion.php";

$floatToRationalTolerance = PHP_FLOAT_MIN * 0x10000000;
$floatToRationalMaxDen = 200;

abstract class FunktionElement {
    public abstract function ausgeben();

    /**
     * Ableiten verändert NICHT
     * @param $variable
     * @return FunktionElement
     */
    public abstract function ableiten() : FunktionElement ;

    /**
     * Vereinfachen 
     * @return FunktionElement
     */
    public abstract function simplify() : FunktionElement ;

    /**
     * bezüglich der konstanten Variablen konstant
     */
    public abstract function isNumeric() : bool ;

    /**
     * bezüglich der Arbeitsvariablen
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


    public function add ($other) : FunktionElement {
        return new Addition($this,$other);
    }
    public function subtract ($other) : FunktionElement {
        return new Subtraktion($this,$other);
    }
    public function multiply ($other) : FunktionElement {
        return new Multiplikation($this,$other);
    }
    public function divideBy ($other) : FunktionElement {
        return new Division($this,$other);
    }
    public function toPower ($other) : FunktionElement {
        return new Potenz($this,$other);
    }
    public function sqrt() : FunktionElement {
        return new Wurzel($this);
    }

    public function equals(FunktionElement $other) : bool
    {
        if ($this->isNumeric() && $other->isNumeric())
            return $other->getValue()->equalsN($this->getValue());

        if (!$this->isNumeric() && !$other->isNumeric()){

            if ($this->isConstant() && $other->isConstant()) {

                return false; //Todo Gleichheit überprüfen
            }

            if (!$this->isConstant() && !$other->isConstant()){

                return false; //Todo Gleichheit überprüfen
            }
            return false; 
        }
        return false; 
    }

}

/**
 * Alle vordefinierten Funktionen sollten als Unterklassen von den Operation - Klassen definiert werden,
 * sie können simplify und müssen ableiten überschreiben, statische Funktionen sollten nicht
 * und ausgeben muss nicht überschrieben werden.
 * Jeder Operator und jede Funktion muss in operations eingetragen werden.
 */
abstract class Operation extends FunktionElement {

    private /* array */ $op;

    public function __construct(FunktionElement ... $op) {

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

    public function ausgeben() //Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        return get_class($this) . "(" .
            implode(", ", array_map(
                function (FunktionElement $a)
                {
                    return $a->ausgeben();
                },
                $this->op))
            . ")";
    }

}

abstract class UnaryOperation extends FunktionElement {

    protected /*FunktionElement*/ $op;
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

    public function ausgeben() //Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        return get_class($this) . "(" .$this->op->ausgeben() . ")";
    }

}

abstract class BinaryOperation extends FunktionElement  {

    //DIESE AUSKOMMENTIERUNG VERUSACHT GROßE PROGRAMMIERSCHWIERIGKEITEN UND VIELE IDE-WARNUNGEN
    //php ist aber erst in 7.3.8 verfügbar und Attribut-Typen werden erst ab 7.4 unterstützt :(
    protected /*FunktionElement*/ $op1, $op2;
    public function __construct($op1, $op2)
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


}

class Variable extends FunktionElement
{
    public static /*bool*/ $noNumerics = false;
    public static /*string*/ $workVariable;
    public /*string*/ $name;
    public /*Numeric*/ $value;
    public /*bool*/ $numeric = false;

    private function __construct(String $name, Numeric $value = null)
    {
        $this->name = $name;
        $this->value = $value;
    }

    public function ableiten() : FunktionElement
    {
        if (self::$workVariable == $this->name)
            return Numeric::one();
        else
            return Numeric::zero();
    }

    public function ausgeben()
    {
        return $this->numeric ?
            "<mi mathvariant='bold'>" . $this->name . "</mi>" :
            "<mi>" . $this->name . "</mi>" ;
    }

    public function simplify() : FunktionElement
    {
        return $this;
    } 

    public function isNumeric(): bool
    {
        //i als einzige Ausnahme (&& hat größere Präzedenz als ||)
        return $this->name == 'i' || !self::$noNumerics && $this->numeric;
    }

    public function isConstant(): bool
    {
        return $this->name != self::$workVariable;
    }

    // wirft entweder Fehler, oder rechnet mit nichtssagenden, konstanten Werten, wenn
    // getValue aufgerufen wird, obwohl diese Variable nicht numeric ist.
    public function getValue() : Numeric
    {
        if (!$this->isNumeric())
            throw new ErrorException("ProgrammierFehler");
        return $this->value;
        //sollte aus einer Liste auf der HTTP-Seite (vom User eigetragene) Werte haben
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

    //Das ist letztlich Variable::init()
    public static /*array*/ $registeredVariables = array();

    public static function ofName($name)
    {
        if (array_key_exists($name, Variable::$registeredVariables))
            return Variable::$registeredVariables[$name];

        $co = new Variable($name);
        $co -> numeric = true;
        switch(strtolower($name)) {
            case "pi":
                $co->name = 'π';
            case "π":
                $co -> value = new Numeric(new FloatReal(pi()), RationalReal::$zero);
                break;
            case "e":
                $co -> value = new Numeric(new FloatReal(2.718281828459045235), RationalReal::$zero);
                break;
            case "i":
                $co -> value = new Numeric(RationalReal::$zero,RationalReal::$one);
                break;
            default:
                $co->numeric = false;
        }
        //hinzufügen
        Variable::$registeredVariables[$name] = $co;
        return $co;
    }

}

Numeric::init();

class Numeric extends FunktionElement
{
    // TODO: Implement Numeric für rationale Werte

    private /*Real*/ $im;
    private /*Real*/ $re;

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

    public function __construct(Real $re, Real $im)
    {
        $this->re = $re;
        $this->im = $im;
    }

    public function ausgeben() : string {
        return $this->toStringHelper();
    }

    private function toStringHelper() : string
    {
        if ($this->im->isZero())
            return $this->re->ausgeben();
        if ($this->re->isZero())
            return $this->im->ausgeben() . "i";
        return "[" . $this->re->ausgeben() . " + " . $this->im->ausgeben() . "i]";
    }

    public function ableiten() : FunktionElement {
        return self::zero();
    }

    public function simplify(): FunktionElement
    {
        return new self($this->re->simplified(),$this->im->simplified());
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
    /// Element-wise

    /// Static

    protected static /*Numeric*/ $one;
    protected static /*Numeric*/ $zero;

    public static function init() {
        RationalReal::$one = new RationalReal(1);
        RationalReal::$zero = new RationalReal(0);
        self::$one = new self(RationalReal::$one, RationalReal::$zero);
        self::$zero = new self(RationalReal::$zero,  RationalReal::$zero);
    }

    public static function zero() : Numeric {
        return self::$zero;
    }


    public static function one() : Numeric {
        return self::$one;
    }

    public static function ofAbsArg(float $r, float $arg) {
        return new self(new FloatReal($r * cos($arg)),new FloatReal($r * sin($arg)));
    }

    public static function ofF(float $reF, float $imF = 0) : self {
        return new self(Real::ofF($reF), Real::ofF($imF));
    }

}

abstract class Real {
    public abstract function floatValue() : float ;

    public abstract function ausgeben() : string ;
    public abstract function isZero() : bool ;
    public abstract function isOne() : bool ;
    public abstract function simplified() : Real ;

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
    public static /*int*/ $displayDigits = 0;
    public /*float*/ $value = 0.0;

    public function __construct(float $value)
    {
        $this->value = $value;
    }

    public function ausgeben() : string {
        if (self::$displayDigits > 0) {
            $thousands_sep = Parser::$commaIsDecimalPoint ? '.' : ',';
            $dec_point = Parser::$commaIsDecimalPoint ? ',' : '.';
            return "<mn>" . number_format ( $this->value , self::$displayDigits, $dec_point, $thousands_sep) . "</mn>";
        }
        return "<mn>".$this->value."</mn>";
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
        //jetztiger / letzter , d.h. erster Bruch ist einfach der Ganzzahlzeil der Zahl/1
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

    public static /*self*/ $zero;
    public static /*self*/ $one;

    protected /*int*/ $num;
    //denominator is natural number
    protected /*int*/ $den;

    public function __construct(int $num, int $den = 1)
    {
        if ($den == 0) {
            echo "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
            echo "ich habe das jetzt mal zu einer 1 geändert...<br>";
            $this->den = 1;
        }
        else {
            if ($den < 0) {
                $den = -$den;
                $num = -$num;
            }
            $this->den = $den;
        }

        $this->num = $num;
        
        $this->simplify();
    }

    public function ausgeben() : string
    {
        if ($this->den == 1 || $this->num == 0)
            return '<mn>' . $this->num . '</mn>';
        return self::fractionAusgeben('<mn>' . $this->num . '</mn>','<mn>' . $this->den . '</mn>');
    }

    public function isOne(): bool
    {
        return $this->num == $this->den;
    }

    public function isZero(): bool
    {
        return $this->num == 0;
    }

    public function simplified() : Real 
    {
        return $this;
    }
    
    private function simplify()
    {
        $g = self::gcd($this->num,$this->den);
        $this->num = intdiv($this->num, $g);
        $this->den =  intdiv($this->den, $g);
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
        return "<mfrac bevelled='false'>" . $num . $den . "</mn></mfrac>";
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
        } while ($b != 0);
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


