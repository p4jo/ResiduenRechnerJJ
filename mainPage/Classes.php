<?php
require_once "ExplicitOperations.php";
require_once "EntireFunktion.php";

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
        return new Wurzel([$this]);
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

Numeric::init();

abstract class Numeric extends FunktionElement
{
    // TODO: Implement Numeric für rationale Werte


    public function ableiten() : FunktionElement {
        return self::zero();
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

    public abstract function addN(Numeric $other) : Numeric ;

    public abstract function subtractN(Numeric $other) : Numeric ;
    
    public abstract function multiplyN(Numeric $other) : Numeric ;

    public abstract function divideByN(Numeric $other) : Numeric ;
    
    public function toPowerN(Numeric $other) : Numeric
    {
        $r = $this->abs();
        $phi = $this->arg();
        return self::ofAbsArg(pow($r,$other->re()()) * exp($phi * $other -> im()()),
                                $phi * $other ->re() + log($r) * $other->im()());
    }

    public function sqrtN()
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrige Wurzel einführen
        return self::ofAbsArg($this->abs(), $this->arg() / 2);
    }

    public abstract function re() : float ;
    public abstract function im() : float ;

    public function arg() : float {
        return atan2($this->im(), $this->re());
    }

    public function absSquared() : float {
        $re = $this->re();
        $im = $this->im();
        return $re * $re + $im * $im;
    }

    public function abs() : float {
        return sqrt($this->absSquared());
    }

    /// Element-wise
    /// Static

    protected static $one;
    protected static $zero;

    public static function init() {
        self::$one = new RationalNumber(1, 1, 0, 1);
        self::$zero = new RationalNumber(0, 1, 0, 1);
    }

    public static function zero() : Numeric {
        return self::$zero;
    }

    public static function one() : Numeric {
        return self::$one;
    }

    public static function ofAbsArg(float $r, float $arg) {
        return new FloatyNumber($r * cos($arg), $r * sin($arg));
    }

    public static function complexAusgabe($real, $imaginary) {
        if (!$imaginary)
            return $real;
        if (!$real)
            return $imaginary. 'i';
        return "[" . $real ." + " . $imaginary . "i]";
    }

/*
    public static function of(float $v){
        if ($v == 0)
            return self::$zero;
        if ($v == 1)
            return self::$one;
        return new self($v);
    }*/

}

class FloatyNumber extends Numeric {
    public static /*int*/ $displayDigits = 0;

    private /*float*/ $im;
    private /*float*/ $re;

    public function re() : float {
        return $this->re;
    }
    public function im() : float {
        return $this->im;
    }

    public function __construct($re, $im = 0)
    {
        $this->re = $re;
        $this->im = $im;
    }

    public function ausgeben() {
        if (self::$displayDigits > 0) {
            $thousands_sep = Parser::$commaIsDecimalPoint ? '.' : ',';
            $dec_point = Parser::$commaIsDecimalPoint ? ',' : '.';
            return Numeric::complexAusgabe(
                number_format ( $this->re , self::$displayDigits, $dec_point, $thousands_sep),
                number_format ( $this->im , self::$displayDigits, $dec_point, $thousands_sep));
        }
        return Numeric::complexAusgabe($this->re,$this->im);
    }

    public function isOne(): bool
    {
        return $this->re == 1 && $this->im == 0;
    }

    public function isZero(): bool
    {
        return $this->re == 0 && $this->im == 0;
    }


    public function addN(Numeric $other) : Numeric
    {
        return new FloatyNumber($this->re() + $other->re(), $this->im() + $other->im());
    }

    public function subtractN(Numeric $other) : Numeric
    {
        return new FloatyNumber($this->re() - $other->re(), $this->im() - $other->im());
    }

    public function multiplyN(Numeric $other) : Numeric
    {
        return new FloatyNumber($this->re() * $other->re() - $this->im() * $other->im(),
            $this->re() * $other->im() + $this->im() * $other->re());
    }

    //z / w = z mal w* / |w|²
    public function divideByN(Numeric $other) : Numeric
    {
        return new FloatyNumber(($this->re() * $other->re() + $this->im() * $other->im())
            / $other->absSquared()     ,
            ($this->im() * $other->re() - $this->re() * $other->im())
            / $other->absSquared()
        );
    }

    public function simplify(): FunktionElement
    {
        return new self($this->re,$this->im);
        // TODO: Rationalisieren, wenn möglich.
    }
}

class RationalNumber extends Numeric
{
    protected /*int*/ $reZ;
    //Nenner is natural Number
    protected /*int*/ $reN;
    protected /*int*/ $imZ;
    //Nenner is natural Number
    protected /*int*/ $imN;

    public function __construct(int $reZ, int $reN = 1, int $imZ = 0, int $imN = 1)
    {
        if ($reN == 0) {
            echo "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
            echo "ich habe das jetzt mal zu einer 1 geändert...<br>";
            $this->reN = 1;
        }
        else {
            if ($reN < 0) {
                $reN = -$reN;
                $reZ = -$reZ;
            }
            $this->reN = $reN;
        }

        $this->reZ = $reZ;

        if ($imN == 0){
            echo "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
            echo "ich habe das jetzt mal zu einer 1 geändert...<br>";
            $this->reN = 1;
        }
        else
            $this->imN = $imN;

        $this->imZ = $imZ;
    }

    public function ausgeben()
    {
        return Numeric::complexAusgabe(self::fractionAusgeben($this->reZ,$this->reN), self::fractionAusgeben($this->imZ,$this->imN)) ;
    }

    public function isOne(): bool
    {
        return $this->reZ == $this->reN && $this->imZ == 0;
    }

    public function isZero(): bool
    {
        return $this->reZ == 0 && $this->imZ == 0;
    }

    public function simplify(): FunktionElement
    {

        return new self($this->reZ,$this->reN,$this->imZ,$this->imN);
        //todo kürzen
    }

    public function addN(Numeric $other): Numeric
    {
        return $this; // TODO: Change the autogenerated stub
    }

    public function subtractN(Numeric $other): Numeric
    {
        return $this; // TODO: Change the autogenerated stub
    }

    public function multiplyN(Numeric $other): Numeric
    {
        return $this; // TODO: Change the autogenerated stub
    }

    public function divideByN(Numeric $other): Numeric
    {
        if ($other instanceof self) {
            return new self();
        }
        //sieht nur aus wie ein statischer Aufruf
        return parent::divideByN($other);
    }

    public function re(): float
    {
        return $this->reZ / $this->reN;
    }

    public function im(): float
    {
        return $this->imZ / $this->imN;
    }

    public static function fractionAusgeben($num, $den) {
        if ($den == 1 || $num == 0)
            return $num;
        return "<mfrac>$num  $den</mfrac>";
    }

    public static function addF($z1, $n1, $z2, $n2) {
        return

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

    /**
     * Greatest common divisor of numbers "a" and "b"
     * @param int $a only natural numbers
     * @param int $b only natural numbers
     * @return int
     */
    public static function gcd(int $a, int $b) : int{
        $r = 0;
        do {
            $r = $a % $b;
            $a = $b;
            $b = $r;
        } while ($b != 0);
        return $a;
    }


}

/*
Constant::init();

class Constant extends Numeric {
    // TODO: Implement Numeric für komplexe Werte

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


class Variable extends FunktionElement
{
    public static /*bool*/ $noNumerics = false;
    public static /*string*/ $workVariable;
    public /*string*/ $name;
    public /*Numeric*/ $value;
    public /*bool*/ $numeric = false;

    private function __construct(String $name, Numeric $value)
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
        //i als einzige Ausnahme
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
        //sollte aus einer Liste auf der HTTP-Seite (vom User eigetragene) Werte laden
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
    //TODO: Variablen als Liste mit re(),im,numeric bearbeitbar anzeigen, nachdem der Ausdruck geparsed wurde
    public static /*array*/ $registeredVariables = array();

    public static function ofName($name)
    {
        if (array_key_exists($name, Variable::$registeredVariables))
            return Variable::$registeredVariables[$name];

        $co = new Variable($name,Numeric::one());
        $co -> numeric = true;
        switch(strtolower($name)) {
            case "pi":
                $co->name = 'π';
            case "π":
                $co -> value = new FloatyNumber(pi(), 0);
                break;
            case "e":
                $co -> value = new FloatyNumber(2.718281828459045235, 0);
                break;
            case "i":
                $co -> value = new FloatyNumber(0, 1);
                break;
            default:
                $co->numeric = false;
        }
        //hinzufügen
        Variable::$registeredVariables[$name] = $co;
        return $co;
    }

}

