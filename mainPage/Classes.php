<?php
require_once "ExplicitOperations.php";
require_once "GeneralStuff.php";

Constant::init();
Funktion::init();

abstract class FunktionElement {
    public abstract function ausgeben();
    public abstract function ableiten(string $varName) : FunktionElement;
    public abstract function vereinfachen();

    public function istNull(){
        if($this instanceof Numeric) {
            return $this->gebeWert() == 0;
        }
        return false;
    }

    public function add ($other) {
        return new Addition($this,$other);
    }
    public function subtract ($other) {
        return new Subtraktion($this,$other);
    }
    public function multiply ($other) {
        return new Multiplikation($this,$other);
    }
    public function divideBy ($other) {
        return new Division($this,$other);
    }
    public function toPower ($other) {
        return new Potenz($this,$other);
    }

}

abstract class Operation extends FunktionElement {

    protected $op;

    public function __construct(array $op, $arity)
    {
        if(count($op) != $arity)
            throw new InvalidArgumentException($arity . "-ärer Operator wurde mit " . count($op) . "Operanden erstellt");
        $this->op = $op;
    }
}


abstract class UnaryOperation extends Operation {

    public function __construct($op)
    {
        if ($op instanceof FunktionElement)
            parent::__construct([$op], 1);
        else
            parent::__construct($op, 1);
    }
}

abstract class BinaryOperation extends Operation  {

    public function __construct($op1, $op2)
    {
        parent::__construct([$op1, $op2], 2);
    }

}

/**
 * Alle vordefinierten Funktionen müssen als Unterklassen von Funktion definiert werden, sie können vereinfachen
 * und müssen ableiten überschreiben, statische Funktionen sollten nicht und ausgeben muss nicht überschrieben werden.
 */
abstract class Funktion extends Operation {

    protected static $registeredFunktions;
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
    public function vereinfachen() {
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

    public static function isFunktionName($name) {
        return in_array($name, self::$registeredFunktions);
    }

    public static function ofName($name, array $op){
        if(self::isFunktionName($name))
            return new $name($op);
        if(count($op) != 1)
            echo "<br> <bold>WARNING: $name was interpreted as multiplication only to first operand</bold> <br>";
        return new Multiplikation(Variable::ofName($name),$op[0]);
    }
}



class Numeric extends FunktionElement {
    protected $value;

    public function __construct(float $v) {
        $this->value = $v;
    }

    public function ausgeben() {
        /*$kommastellen = 2;
        $formatiert = number_format($this->v, $kommastellen, ",");
        return "<mn>" . $formatiert . "</mn>";*/
        return "<mn>" . $this->value . "</mn>";
    }

    public function ableiten($varName) : FunktionElement {
        return new Numeric(0);
    }

    public function gebeWert() {
        return $this->value;
    }

    public function increment() {
        return $this->value + 1;
    }

    public function decrement() {
        return $this->value - 1;
    }

    public function vereinfachen() {
        return $this;
    }
}

class Constant extends Numeric {
    private  $viewName;
    private static  $allConstants;

    public static function init() {
        self::$allConstants = [
            "π" => new Constant("&pi;",3.14159265358979),
            "pi" => new Constant("&pi;",3.14159265358979),
            "e" => new Constant("e", 2.718281828459045235)
        ];
        //echo "Constant init";
    }

    private function __construct( string $viewName, float $value){
        parent::__construct($value);
        $this->viewName = $viewName;
    }

    public static function ofName(String $name) {
        return self::$allConstants[$name];
    }

    public static function isConstantName(string $name) {
        return array_key_exists($name, self::$allConstants);
    }

    public function ausgeben() {
            return "<mi> $this->viewName </mi>";
    }

    public function gebeWert() {
        return $this->value;
    }

    public function increment() {
        return new Addition($this, new Numeric(1));
    }

    public function decrement() {
        return new Subtraktion($this, new Numeric(1));
    }

}


class Variable extends FunktionElement
{
    private $name;
    public static $registeredVariables = array();

    private function __construct(String $name)
    {
        $this->name = $name;
    }

    public function ableiten($varName) : FunktionElement
    {
        if ($varName == $this->name)
            return new Numeric(1);
        else
            return new Numeric(0);
    }

    public function ausgeben()
    {
        return "<mi>" . $this->name . "</mi>";
    }

    public function vereinfachen()
    {
        return $this;
    }

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

