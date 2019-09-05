<?php
require_once "ExplicitOperations.php";
require_once "GeneralStuff.php";

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

    // WARNING: ONLY CALL ON (RELATIVELY) CONSTANT OBJECTS
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
 * Alle vordefinierten Funktionen sollten als Unterklassen von Funktion oder UnaryFunktion definiert werden,
 * sie können simplify und müssen ableiten überschreiben, statische Funktionen sollten nicht
 * und ausgeben muss nicht überschrieben werden.
 * Jede Funktion muss in funktions eingetragen werden.
 */
abstract class Operation extends FunktionElement {

    private array $op;

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

    //Wenn man toll ist, vielleicht sowas wie arctan(tan( aufheben in Implementierungen
    public function simplify() : FunktionElement {
        return $this;
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

    /// Element-wise
    /// Static
//TODO VOR die Lauf-Zeit schieben, d.h. bei jedem Hinzufügen auch in registeredfunctions adden (wie bei operations)
    static function init() {
        $result = array();
        foreach (get_declared_classes() as $class) {
            if (is_subclass_of($class, "Funktion"))
                $result[] = $class;
        }
        self::$registeredFunktions = $result;
        //echo "Funktion init";
    }

    protected static $registeredFunktions;

    public static function isFunktionName($name) {
        return in_array($name, self::$registeredFunktions);
    }
/*
    public static function ofName($name, array $op){
        if(self::isFunktionName($name))
            return new $name($op);
        throw new InvalidArgumentException("Funktion::ofName called with invalid name");
    }
*/
}


/**
 * Alle vordefinierten Funktionen müssen als Unterklassen von Funktion definiert werden, sie können simplify
 * und müssen ableiten überschreiben, statische Funktionen sollten nicht und ausgeben muss nicht überschrieben werden.
 * Jede Funktion muss public const arity definieren
 */
abstract class UnaryFunktion extends Operation {

    protected FunktionElement $op;

    public function __construct(FunktionElement $op){
        $this->op = $op;
    }

    public function isNumeric() : bool {
        return $this->op->isNumeric();
    }

    //Wenn man toll ist, vielleicht sowas wie arctan(tan( aufheben in Implementierungen
    public function simplify() : FunktionElement {
        return $this;
    }

    public function ausgeben() //Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        return get_class($this) . "(" .$this->op->ausgeben() . ")";
    }

    /// Element-wise
    /// Static
//TODO VOR die Lauf-Zeit schieben, d.h. bei jedem Hinzufügen auch in registeredfunctions adden (wie bei operations)
    static function init() {
        $result = array();
        foreach (get_declared_classes() as $class) {
            if (is_subclass_of($class, "Funktion"))
                $result[] = $class;
        }
        self::$registeredFunktions = $result;
        //echo "Funktion init";
    }

    protected static $registeredFunktions;

    public static function isFunktionName($name) {
        return in_array($name, self::$registeredFunktions);
    }
    /*
        public static function ofName($name, array $op){
            if(self::isFunktionName($name))
                return new $name($op);
            throw new InvalidArgumentException("Funktion::ofName called with invalid name");
        }
    */
}

Numeric::init();

class Numeric extends FunktionElement
{
    // TODO: Implement Numeric für rationale Werte
    public $im;
    public $re;

    public function __construct($re, $im)
    {
        $this->re = $re;
        $this->im = $im;
    }

    public function ausgeben() {
        /*$kommastellen = 2;
        $formatiert = number_format($this->v, $kommastellen, ",");
        return "<mn>" . $formatiert . "</mn>";*/
        return "<mn>" . $this->re ."˕i" . $this->im . "</mn>";
    }

    public function ableiten() : FunktionElement {
        return self::zero();
    }

    public function getValue() : Numeric {
        return $this;
    }

    public function simplify() : FunktionElement {
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

    public function isOne() : bool {
        //TOdo vielleicht  doch als vergleich ersetzen
        return $this === self::$one;
    }

    public function isZero() : bool {
        return $this === self::$zero;
    }

    public function addN(Numeric $other) : Numeric
    {
        return new Numeric($this->re + $other->re, $this->im + $other->im);
    }

    public function subtractN(Numeric $other) : Numeric
    {
        return new Numeric($this->re - $other->re, $this->im - $other->im);
    }

    public function multiplyN(Numeric $other) : Numeric
    {
        return new Numeric($this->re * $other->re - $this->im * $other->im,
                        $this->re * $other->im + $this->im * $other->re);
    }

    //z / w = z ° w* / |w|²
    public function divideByN(Numeric $other) : Numeric
    {
        return new Numeric(($this->re * $other->re + $this->im * $other->im)
                            / $other->absSquared()     ,
             ($this->im * $other->re - $this->re * $other->im)
            / $other->absSquared()
        );
    }

    public function toPowerN(Numeric $other) : Numeric
    {
        $r = $this->abs();
        $phi = $this->arg();
        return self::ofAbsArg(pow($r,$other->re) * exp($phi * $other -> im),
                                $phi * $other ->re + ln($r) * $other->im);
    }

    public function sqrtN()
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrige Wurzel einführen
        $r = $this->abs();
        $phi = $this->arg();
        return self::ofAbsArg($r, $phi / 2);
    }

    public function arg() : float {
        return atan2($this->im, $this->re);
    }

    public function abs() : float {
        return sqrt($this->absSquared());
    }

    public function absSquared() : float {
        return $this->re * $this->re + $this->im * $this->im;
    }

    /// Element-wise
    /// Static

    protected static $one;
    protected static $zero;

    public static function init() {
        self::$one = new self(1, 0);
        self::$zero = new self(0, 0);
    }

    public static function zero() : Numeric {
        return self::$zero;
    }

    public static function one() : Numeric {
        return self::$one;
    }

    public static function ofAbsArg(float $r, float $arg) {
        return new Numeric($r * cos($arg), $r * sin($arg));
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
    private /*string*/ $name;
    public /*Numeric*/ $value;
    public /*bool*/ $numeric = false;

    private function __construct(String $name, Numeric $value)
    {
        $this->name = $name;
        $this->value = $value;
    }

    public function ableiten() : FunktionElement
    {
        global $workVariable;
        if ($workVariable == $this)
            return Numeric::one();
        else
            return Numeric::zero();
    }

    public function ausgeben()
    {
        return $this->numeric ?
            "<mi>" . $this->name . "</mi>" :
            "<mi>" . $this->name . "</mi>" ;
    }

    //Könnte eigentlich zu einem Numeric simplify, aber ich behandele es jetzt durch getValue eh so
    public function simplify() : FunktionElement
    {
        return $this;
    } 

    public function isNumeric(): bool
    {
        return $this->numeric;
    }

    public function isConstant(): bool
    {
        global $workVariable;
        return $this !== $workVariable;
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
    //TODO: Variablen als Liste mit re,im,numeric bearbeitbar anzeigen, nachdem der Ausdruck geparsed wurde
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
                $co -> value = new Numeric(pi(), 0);
                break;
            case "e":
                $co -> value = new Numeric(2.718281828459045235, 0);
                break;
            case "i":
                $co -> value = new Numeric(0, 1);
                break;
            default:
                $co->numeric = false;
        }
        //hinzufügen
        Variable::$registeredVariables[$name] = $co;
        return $co;
    }

}

