<?php

Constant::init();
Funktion::init();





abstract class FunctionElement {
    public abstract function ausgeben();
    public abstract function ableiten();
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

abstract class Operation extends FunctionElement {
    public const arity = 2;
    protected array $op;

    public function __construct(array $op)
    {
        if(count($op) != self::arity)
            throw new InvalidArgumentException(self::arity . "-ärer Operator wurde mit " . count($op) . "Operanden erstellt");
        $this->op = $op;
    }

    public function ausgeben() //Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        return get_class($this) . "(" . implode(", ", array_map(
                function ($a) {return $a->ausgeben(); }, $this->operand))
            . ")";
    }

}

abstract class UnaryOperation extends Operation {
    public const arity = 1;

    public function __construct(FunctionElement $op)
    {
        parent::__construct([$op]);
    }
}

abstract class BinaryOperation extends Operation  {
    public const arity = 2;

    public function __construct(FunctionElement $op1, FunctionElement $op2)
    {
        parent::__construct([$op1, $op2]);
    }

}

//Alle vordefinierten Funktionen wie cos müssen als Unterklassen von Funktion definiert werden und sollten ausgeben und ofName nicht überschreiben
abstract class Funktion extends Operation{

    protected static array $registeredFunktions;
    static function init() {
        $result = array();
        foreach (get_declared_classes() as $class) {
            if (is_subclass_of($class, "Funktion"))
                $result[] = $class;
        }
        $registeredFunktions = $result;
    }

    //Wenn man toll ist, vielleicht sowas wie arctan(tan( aufheben in Implementierungen
    public function vereinfachen() {
        return $this;
    }

    public abstract function ableiten() ;

    public static function ofName($name, array $op){
        if(in_array($name,self::$registeredFunktions))
            return new $name($op);
        if(count($op) != 1)
            echo "<br> <bold>WARNING: $name was interpreted as multiplication only to first operand</bold> <br>";
        return new Multiplikation(Variable::ofName($name),$op[0]);
    }
}


class Addition extends BinaryOperation {

    public function ausgeben() {
        return "<mrow> " . $this->op[0]->ausgeben() . "<mo>+</mo>" . $this->op[1]->ausgeben() . "</mrow> ";
    }

    public function ableiten() {
        return $this->op[0]->ableiten().add(  $this->op[1]->ableiten());
    }

    public function vereinfachen() {
        $this->op[0] = $this->op[0]->vereinfachen();
        $this->op[1] = $this->op[1]->vereinfachen();

        if($this->op[0] instanceof Numeric && $this->op[1] instanceof Numeric) {
            return new Numeric($this->op[0]->gebeWert() + $this->op[1]->gebeWert());
        }

        //0 kann weg
        if($this->op[0] instanceof Numeric && $this->op[0]->gebeWert() == 0) {
            return $this->op[1];
        }
        if($this->op[1] instanceof Numeric && $this->op[1]->gebeWert() == 0) {
            return $this->op[0];
        }

        //Fall 1
        if($this->op[0] instanceof Numeric && ($this->op[1] instanceof Addition || $this->op[1] instanceof Subtraktion)) {
            $result = 0;
            $op[1] = $this->op[1]->hasNumeric($result);
            if($result != 0) {
                return new Addition(new Numeric($this->op[0]->gebeWert() + $result), $op[1]);
            }
        }

        //Fall 2
        if($this->op[1] instanceof Numeric && ($this->op[0] instanceof Addition || $this->op[0] instanceof Subtraktion)) {
            $result = 0;
            $op[0] = $this->op[0]->hasNumeric($result);
            if($result != 0) {
                return new Addition(new Numeric($this->op[1]->gebeWert() + $result), $op[0]);
            }
        }

        return $this;
    }

    public function hasNumeric(int &$output) {
        if($this->op[0] instanceof Numeric) {
            $output = $this->op[0]->gebeWert();
            return $this->op[1];
        }
        if($this->op[1] instanceof Numeric) {
            $output = $this->op[1]->gebeWert();
            return $this->op[0];
        }

        if($this->op[0] instanceof Addition || $this->op[0] instanceof Subtraktion) {
            $this->op[0] = $this->op[0]->hasNumeric($output);
            return $this;
        }

        if($this->op[1] instanceof Addition || $this->op[1] instanceof Subtraktion) {
            $this->op[1] = $this->op[1]->hasNumeric($output);
            return $this;
        }
        return $this;
    }
}

class Subtraktion extends BinaryOperation {

    public function ausgeben() {
        return "<mrow> " . $this->op[0]->ausgeben() . "<mo>-</mo>" . $this->op[1]->ausgeben() . "</mrow> ";
    }

    public function ableiten() {
        return new Subtraktion($this->op[0]->ableiten(), $this->op[1]->ableiten());
    }

    public function vereinfachen() {
        $this->op[0] = $this->op[0]->vereinfachen();
        $this->op[1] = $this->op[1]->vereinfachen();

        if($this->op[0] instanceof Numeric && $this->op[1] instanceof Numeric) {
            return new Numeric($this->op[0]->gebeWert() - $this->op[1]->gebeWert());
        }

        //Fall 1
        if($this->op[0] instanceof Numeric && ($this->op[1] instanceof Addition || $this->op[1] instanceof Subtraktion)) {
            $result = 0;
            $op[1] = $this->op[1]->hasNumeric($result);
            if($result != 0) {
                return new Subtraktion(new Numeric($this->op[0]->gebeWert() + $result), $op[1]);
            }
        }

        //Fall 2
        if($this->op[1] instanceof Numeric && ($this->op[0] instanceof Addition || $this->op[0] instanceof Subtraktion)) {
            $result = 0;
            $op[0] = $this->op[0]->hasNumeric($result);
            if($result != 0) {
                return new Subtraktion($op[0], new Numeric(-($this->op[1]->gebeWert() + $result)));
            }
        }

        return $this;
    }


    public function hasNumeric(int &$output) {
        if($this->op[0] instanceof Numeric) {
            $output = $this->op[0]->gebeWert();
            return $this->op[1];
        }
        if($this->op[1] instanceof Numeric) {
            $output = $this->op[1]->gebeWert();
            return $this->op[0];
        }

        if($this->op[0] instanceof Addition || $this->op[0] instanceof Subtraktion) {
            $this->op[0] = $this->op[0]->hasNumeric($output);
            return $this;
        }

        if($this->op[1] instanceof Addition || $this->op[1] instanceof Subtraktion) {
            $this->op[1] = $this->op[1]->hasNumeric($output);
            return $this;
        }
        return $this;
    }
}

class Multiplikation extends BinaryOperation {

    public function ausgeben() {
        return "<mrow> " . $this->op[0]->ausgeben() . "<mo>&middot;</mo>" . $this->op[1]->ausgeben() . "</mrow> ";
    }

    public function ableiten() {
        return new Addition(new Multiplikation($this->op[0]->ableiten(), $this->op[1]), new Multiplikation($this->op[0], $this->op[1]->ableiten()));
    }

    public function vereinfachen() {
        $this->op[0] = $this->op[0]->vereinfachen();
        $this->op[1] = $this->op[1]->vereinfachen();

        if($this->op[0] instanceof Numeric && $this->op[1] instanceof Numeric) {
            return new Numeric($this->op[0]->gebeWert() * $this->op[1]->gebeWert());
        }

        if($this->op[0] instanceof Numeric && $this->op[0]->gebeWert() == 0) {
            return new Numeric(0);
        }
        if($this->op[0] instanceof Numeric && $this->op[0]->gebeWert() == 1) {
            return $this->op[1];
        }

        if($this->op[1] instanceof Numeric && $this->op[1]->gebeWert() == 0) {
            return new Numeric(0);
        }
        if($this->op[1] instanceof Numeric && $this->op[1]->gebeWert() == 1) {
            return $this->op[0];
        }
        echo "Nichts vereinfacht (multiplikation) <math>" . $this->ausgeben() . "</math><br>";

        return $this;
    }
}

class Division extends BinaryOperation {

    public function __construct($op0, $op1){
        parent::__construct($op0,$op1);
        if($this->op[1] instanceof Numeric && $this->op[1]->gebeWert() == 0) {
            echo "\n\nALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!\n";
            echo "ich habe das jetzt mal zu einer 1 geändert...\n\n";
            $this->op[1] = new Numeric(1);
        }
    }

    public function ausgeben() {
        return "<mrow> <mfrac>" .  $this->op[0]->ausgeben() . $this->op[1]->ausgeben() . " </mfrac> </mrow>";
    }

    public function ableiten() {
        return new Division(new Subtraktion(new Multiplikation($this->op[0]->ableiten(), $this->op[1]), new Multiplikation($this->op[0], $this->op[1]->ableiten())), new Potenz($this->op[1], new Numeric(2)));
    }

    public function vereinfachen() {
        $this->op[0] = $this->op[0]->vereinfachen();
        $this->op[1] = $this->op[1]->vereinfachen();

        if($this->op[0] instanceof Numeric && $this->op[1] instanceof Numeric) {
            if($this->op[0]->gebeWert() % $this->op[1]->gebeWert() == 0)
                return new Numeric($this->op[0]->gebeWert() / $this->op[1]->gebeWert());
        }

        return $this;
    }
}

class Potenz extends BinaryOperation {

    public function ausgeben() {
        return "<mrow> <msup>" .  $this->op[0]->ausgeben() . $this->op[1]->ausgeben() . " </msup> </mrow>";
    }

    public function ableiten() {
        if($this->istXhochR()) {
            $pot2 = new Potenz($this->op[0], new Numeric($this->op[1]->decrement()));
            return new Multiplikation($this->op[1], $pot2);
        } else if($this->op[0] instanceof Constant && $this->op[0]->istWert("e")) {
            return new Multiplikation($this->op[1]->ableiten(), $this);
        } else {
            echo "Kann nicht folgendes Ableiten:" . $this->ausgeben();
        }
    }

    public function vereinfachen() {
        $this->op[0] = $this->op[0]->vereinfachen();
        $this->op[1] = $this->op[1]->vereinfachen();

        if($this->op[0] instanceof Numeric && $this->op[1] instanceof Numeric) {
            return new Numeric(pow($this->op[0]->gebeWert(), $this->op[1]->gebeWert()));
        }

        if($this->op[1] instanceof Numeric && $this->op[1]->gebeWert() == 1) {
            return $this->op[0];
        }

        return $this;
    }

    public function istXhochR() {
        return ($this->op[0] instanceof Variable) && ($this->op[1] instanceof Value);
    }

    public function istQuadratisch() {
        return ($this->op[1] instanceof Numeric  && $this->op[1]->gebeWert() == 2);
    }

    public function gebeBasis() {
        return $this->op[0];
    }
}

class Wurzel extends UnaryOperation {


    public function ausgeben() {
        return "<mrow> <msqrt>" .  $this->op[0]->ausgeben() . " </msqrt> </mrow>";
    }

    public function ableiten() {
        return $this -> op[0] -> ableiten() -> divideBy($this -> multiply(2)) ;
    }

    public function vereinfachen() {
        $this->op[0] = $this->op[0]->vereinfachen();

        if($this->op[0] instanceof exponent && $this->op[0]->istQuadratisch()) {
            return $this->op[0]->gebeBasis();
        }

        return $this;
    }
}





abstract class Value extends FunctionElement {
    public abstract function gebeWert();
    public abstract function increment();
    public abstract function decrement();

    public function ableiten() {
        return new Numeric(0);
    }
}


class Numeric extends Value {
    protected float $value;

    public function __construct(float $v){
        $this->value = $v;
    }

    public function ausgeben() {
        /*$kommastellen = 2;
        $formatiert = number_format($this->v, $kommastellen, ",");
        return "<mn>" . $formatiert . "</mn>";*/
        return "<mn>" . $this->value . "</mn>";
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
    private string $name;
    private string $viewName;
    private static array $allConstants;

    public static function init() {
        $allConstants = [
            new Constant("π","&pi;",3.14159265358979),
            new Constant("pi","&pi;",3.14159265358979),
            new Constant("e", "e", 2.718281828459045235)
        ];
    }

    private function __construct(string $name, string $viewName, float $value){
        $this->name = $name;
        $this->viewName = $viewName;
        $this->value = $value;
    }

    public static function ofName(String $name) {
        return self::$allConstants[$name];
    }

    public static function isConstantName(string $name) {
        return array_key_exists($name);
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


class Variable extends FunctionElement
{
    private $name;
    public static $registeredVariables = array();

    private function __construct(String $name)
    {
        $this->name = $name;
    }

    public function ableiten()
    {
        return new Numeric(1);
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
        if(Constant::isConstantName($name))
            return Constant::ofName($name);

        if (array_key_exists($name, Variable::$registeredVariables))
            return Variable::$registeredVariables[§name];
        $a =  new Variable(§name);
        Variable::$registeredVariables[§name] = §a;
        return $a;
    }
}

class Checker {
    public function istQuadratisch(FunctionElement $e){
        return "NICHTS";
    }

}



class kompletteFunktion {
    //Hier ist das Wurzelelement gemeint, nicht die mathematische Wurzel
    private FunctionElement $wurzel;

    public function __construct(FunctionElement $wurzel){
        $this->wurzel = $wurzel;
    }


    public function ausgeben() {
        return "<math>
									<mpadded>
										<mstyle mathsize=\"2em\" mathvariant=\"bold\">" .
            $this->wurzel->ausgeben() .
            "</mstyle>
									</mpadded>
								</math> <br><br>";
    }

    public function vereinfachen() {
        $this->wurzel = $this->wurzel->vereinfachen();
        return $this;
    }

    public function ableiten() {
        return new kompletteFunktion($this->wurzel->ableiten());
    }

}