<?php
require_once "ExplicitOperations.php";
require_once "GeneralStuff.php";

abstract class FunktionElement {
    public abstract function ausgeben();
    public abstract function ableiten($variable) : FunktionElement ;
    public abstract function vereinfachen($variable) : FunktionElement ;
    public abstract function constant($variable) : bool ;

    public function isOne() : bool {
        return false;
    }
    public function isZero() : bool {
        return false;
    }

    // WARNING: ONLY CALL ON (RELATIVELY) CONSTANT OBJECTS
    public abstract function getValue();


    public function add ($other) : FunktionElement {
        return new Addition([$this,$other]);
    }
    public function subtract ($other) : FunktionElement {
        return new Subtraktion([$this,$other]);
    }
    public function multiply ($other) : FunktionElement {
        return new Multiplikation([$this,$other]);
    }
    public function divideBy ($other) : FunktionElement {
        return new Division([$this,$other]);
    }
    public function toPower ($other) : FunktionElement {
        return new Potenz([$this,$other]);
    }
    public function sqrt() : FunktionElement {
        return new Wurzel([$this]);
    }

}

abstract class Operation extends FunktionElement {

    //FunktionElement[] op
    protected $op;

    public function __construct(array $op)
    {/*
        if(count($op) != $arity)
            throw new InvalidArgumentException($arity . "-ärer Operator wurde mit " . count($op) . "Operanden erstellt");
    */
        $this->op = $op;
    }

    public function constant($variable) : bool {
        $result = true;
        foreach ($this->$op as $o)
        {
            $result = $result && $o -> constant($variable);
        }
        return $result;
    }
}

/*
abstract class UnaryOperation extends Operation {

    public function __construct($op)
    {
        if ($op instanceof FunktionElement)
            parent::__construct([$op]);
        else
            parent::__construct($op);
    }
}

abstract class BinaryOperation extends Operation  {

    public function __construct(array $op)
    {
        parent::__construct($op, 2);
    }

}*/

Funktion::init();

/**
 * Alle vordefinierten Funktionen müssen als Unterklassen von Funktion definiert werden, sie können vereinfachen
 * und müssen ableiten überschreiben, statische Funktionen sollten nicht und ausgeben muss nicht überschrieben werden.
 * Jede Funktion muss public const arity definieren
 */
abstract class Funktion extends Operation {

    static function init() {
        $result = array();
        foreach (get_declared_classes() as $class) {
            if (is_subclass_of($class, "Funktion"))
                $result[] = $class;
        }
        self::$registeredFunktions = $result;
        //echo "Funktion init";
    }

    //Wenn man toll ist, vielleicht sowas wie arctan(tan( aufheben in Implementierungen
    public function vereinfachen($variable) : FunktionElement {
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
/**
 * Class Numeric
 * Instances can only be obtained via Constant::of(float $value)
 */
class Numeric extends FunktionElement
{
    // TODO: Implement Numeric für komplexe Werte
    protected $value;

    protected function __construct(float $v)
    {
        $this->value = $v;
    }

    public function ausgeben() {
        /*$kommastellen = 2;
        $formatiert = number_format($this->v, $kommastellen, ",");
        return "<mn>" . $formatiert . "</mn>";*/
        return "<mn>" . $this->value . "</mn>";
    }

    public function ableiten($variable) : FunktionElement {
        return self::zero();
    }

    public function getValue() {
        return $this->value;
    }

    public function increment() {
        return self::of($this->value + 1);
    }

    public function decrement() {
        return self::of($this->value - 1);
    }

    public function vereinfachen($variable) : FunktionElement {
        return $this;
    }

    public function constant($variable): bool
    {
        return true;
    }

    public function isOne() : bool {
        return $this === self::$one;
    }

    public function isZero() : bool {
        return $this === self::$zero;
    }


    /// Element-wise
    /// Static

    protected static $one;
    protected static $zero;

    public static function init() {
        self::$one = new self(1);
        self::$zero = new self(0);
    }

    public static function zero() : FunktionElement {
        return self::$zero;
    }

    public static function one() : FunktionElement {
        return self::$one;
    }

    public static function of(float $v){
        if ($v == 0)
            return self::$zero;
        if ($v == 1)
            return self::$one;
        return new self($v);
    }
}

Constant::init();

/**
 * Class Constant
 * Instances can only be obtained via Constant::ofName($name)
 */
class Constant extends Numeric {
    // TODO: Implement Numeric für komplexe Werte

    private $viewName;

    protected function __construct( string $viewName, float $value){
        parent::__construct($value);
        $this->viewName = $viewName;
    }

    public function ausgeben() {
            return "<mi> $this->viewName </mi>";
    }

    public function increment() {
        return $this -> add (Numeric::one());
    }

    public function decrement() {
        return $this -> subtract(Numeric::one());
    }

    /// Element-wise
    /// Static

    private static  $allConstants;

    public static function init() {
        self::$allConstants = [
            "π" => new Constant("&pi;",3.14159265358979),
            "pi" => new Constant("&pi;",3.14159265358979),
            "e" => new Constant("e", 2.718281828459045235)
            //"i" => new Constant("i",0,1); //mit re,im
        ];
        //echo "Constant init";
    }

    public static function ofName(string $name) {
        return self::$allConstants[$name];
    }

    public static function isConstantName(string $name) {
        return array_key_exists($name, self::$allConstants);
    }

}


class Variable extends FunktionElement
{
    private $name;

    private function __construct(String $name)
    {
        $this->name = $name;
    }

    public function ableiten($variable) : FunktionElement
    {
        if ($variable == $this->name)
            return Numeric::one();
        else
            return Numeric::zero();
    }

    public function ausgeben()
    {
        return "<mi>" . $this->name . "</mi>";
    }

    //Könnte eigentlich zu einem Numeric vereinfachen, aber ich behandele es jetzt durch getValue eh so
    public function vereinfachen($variable) : FunktionElement
    {
        return $this;
    }

    public function constant($variable): bool
    {
        //Leere Arbeitsvariable heißt, alle Variablen als solche lassen, nicht als konstant markieren
        if (!$variable)
            return false;
        return $variable !== $this;
    }

    // wirft entweder Fehler, oder rechnet mit nichtssagenden, konstanten Werten, wenn
    // getValue aufgerufen wird, obwohl $variable = $this ist, d.h. diese Variable nicht konstant.
    public function getValue()
    {
        // TODO: Implement getValue() method.
        throw new ErrorException("Not yet implemented");
        //sollte aus einer Liste auf der HTTP-Seite (vom User eigetragene) Werte laden

    }

    /// Element-wise
    /// Static

    //Das ist letztlich Variable::init()
    public static $registeredVariables = array();

    public static function ofName($name)
    {
        if (Constant::isConstantName($name))
            return Constant::ofName($name);

        if (array_key_exists($name, Variable::$registeredVariables))
            return Variable::$registeredVariables[$name];
        $a =  new Variable($name);
        Variable::$registeredVariables[$name] = $a;
        return $a;
    }

}

