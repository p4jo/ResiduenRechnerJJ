<?php
require_once "Classes.php";
require_once "ExplicitFunctions.php";

// TODO: Auch Operationen müssen, wie Variablen, nur zu Numerics vereinfacht werden dürfen, wenn das gewünscht ist
// (z.B. Additionen immer erlaubt, aber Wurzel und ln nicht erlaubt, weil das in Zahlen in mathematischer Notation auch stehen bleibt

//Enter any new Operator here. By default Operators are left-grouping within their precedence class, add key
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
    'sqrt' => ['name' => 'Wurzel', 'arity' => 1, 'precedence' => 5],
    'ζ' => ['name' => 'RiemannZeta', 'arity' => 1, 'precedence' => 5],
    //Pi-Funktion (entschobene Gamma-Funktion) //postfix
    '!' => [ 'name' => 'Factorial', 'arity' => 1, 'precedence' => 5],
];

//User kann hier eigene "Null-äre Operationen" eintragen, d.h. Kurzschreibweisen wie sin(3x^2), oder pi+e (vereinfachbar)
$two = new Numeric(new RationalReal(2));
$namedFunktionElements = [
    'τ' => ($two)->multiply (Variable::ofName('π')),
    'tri' => Variable::ofName('π')->divideBy($two),
    'φ' => Numeric::one() -> add(new Wurzel(new Numeric(new RationalReal(5)))) -> divideBy($two)
];

abstract class AdditionType extends BinaryOperation {

    public function extractNumeric(Numeric &$output) {
        if($this->op1 -> isNumeric()) {
            $output = $this->op1->getValue();
            return $this->op2;
        }
        if($this->op2 -> isNumeric()) {
            $output = $this->op2->getValue();
            return $this->op1;
        }

        if($this->op1 instanceof AdditionType) {
            $this->op1 = $this->op1->extractNumeric($output);
            return $this;
        }

        if($this->op2 instanceof AdditionType) {
            $this->op2 = $this->op2->extractNumeric($output);
            return $this;
        }
        return $this;
    }

    public function simplify($instance) : FunktionElement {

        //0 kann weg
        if($instance->op1->isZero()) {
            if ($this instanceof Addition)
                return $instance->op2;
            return $instance;
        }
        if($instance->op2->isZero()) {
            return $instance->op1;
        }

        //Fall 1
        if($instance->op2 instanceof AdditionType && $instance->op1 -> isNumeric()) {
            $result = null;
            $simplerop2 = $instance->op2->extractNumeric($result);
            if ($result instanceof Numeric && !$result->isZero()) {
                return $this instanceof Addition ?
                    //TODO korrigieren, vielleicht wieder aufspalten auf Untertypen
                    $instance->op1->getValue() -> addN ($result) -> add ($simplerop2) :
                    $instance->op1->getValue() -> subtractN ($result) -> add ($simplerop2);
            }
        }

        //Fall 2
        if($instance->op1 instanceof AdditionType && $instance->op2 -> isNumeric()) {
            $result = null;
            $simplerop1 = $instance->op1->extractNumeric($result);
            if ($result instanceof Numeric && !$result->isZero()) {
                return $this instanceof Addition ?
                    $instance->op1->getValue() -> addN ($result) -> add ($simplerop1) :
                    $instance->op1->getValue() -> subtractN ($result) -> add ($simplerop1);
            }
        }

        return $instance;
    }
}

class Addition extends AdditionType {

    public function ausgeben() {/*
        if(is_null($this->op1))
            echo"op2 war " .$this->op2->ausgeben();*/
        return "<mrow> <mo>(</mo>" . $this->op1->ausgeben() . "<mo>+</mo>" . $this->op2->ausgeben() . "<mo>)</mo> </mrow> ";
    }
    
    public function inlineAusgeben() {
        return ' (' . $this->op1->inlineAusgeben() . " + " . $this->op2->inlineAusgeben() . ") ";
    }

    public function derivative() : FunktionElement {
        return $this->op1->derivative() -> add(  $this->op2->derivative());
    }


    public function getValue() : Numeric
    {
        return $this->op1->getValue()->addN($this->op2->getValue());
    }

    public function simplified(): FunktionElement
    {
        // Todo So sollte jedes Simplified beginnen
        $simpler = new self($this->op1->simplified(), $this->op2->simplified());

        if($simpler->isNumeric()) {
            return $simpler->getValue();
        }
        //ENDE so
        return parent::simplify($simpler);
    }
}

class Subtraktion extends AdditionType {

    public function ausgeben() {
        return "<mrow> <mo>(</mo> " . ($this->op1->isZero() ? '' : $this->op1->ausgeben()) . "<mo>-</mo>" . $this->op2->ausgeben() . "<mo>)</mo>  </mrow> ";
    }
    
    public function inlineAusgeben() {
        return ' <mo>(</mo> ' . $this->op1->inlineAusgeben() . " - " . $this->op2->inlineAusgeben() . "<mo>)</mo>  ";
    }

    public function derivative() : FunktionElement {
        return $this->op1->derivative() -> subtract ($this->op2->derivative());
    }

    public function getValue() : Numeric
    {
        return $this->op1->getValue()->subtractN($this->op2->getValue());
    }

    public function simplified(): FunktionElement
    {
        // Todo So sollte jedes Simplified beginnen
        $simpler = new self($this->op1->simplified(), $this->op2->simplified());

        if($simpler->isNumeric()) {
            return $simpler->getValue();
        }
        //ENDE so
        return parent::simplify($simpler);
    }
}

class Multiplikation extends BinaryOperation {

    public function ausgeben() {
        return "<mrow> <mo>(</mo> " . $this->op1->ausgeben() . "<mo>&middot;</mo>" . $this->op2->ausgeben() . "<mo>)</mo>  </mrow> ";
    }
    
    public function inlineAusgeben() {
        return ' (' . $this->op1->inlineAusgeben() . " · " . $this->op2->inlineAusgeben() . ") ";
    }

    public function derivative() : FunktionElement {
        return
            $this->op1->derivative() -> multiply($this->op2              ) ->
        add(
            $this->op1->              multiply($this->op2->derivative()));
    }

    public function simplified() : FunktionElement {
        $simpler = new self($this->op1->simplified(), $this->op2->simplified());

        if($simpler->op1 -> isNumeric() && $simpler->op2 -> isNumeric()) {
            return $simpler->op1->getValue() -> multiplyN($simpler->op2->getValue());
        }

        if($simpler->op1 -> isNumeric() && $simpler->op1->isZero()) {
            return Numeric::zero();
        }
        if($simpler->op1 -> isNumeric() && $simpler->op1->isOne()) {
            return $simpler->op2;
        }

        if($simpler->op2 -> isNumeric() && $simpler->op2->isZero()) {
            return Numeric::zero();
        }
        if($simpler->op2 -> isNumeric() && $simpler->op2->isOne()) {
            return $simpler->op1;
        }
        //echo "Nichts vereinfacht (multiplikation) <math>" . $simpler->ausgeben() . "</math><br>";

        return $simpler;
    }

    public function getValue() : Numeric
    {
        return $this->op1->getValue()->multiplyN($this->op2->getValue());
    }
}

class Division extends BinaryOperation {

    public function __construct($op1, $op2){
        parent::__construct($op1, $op2);
        if($this->op2 -> isZero()) {
            echo "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
            echo "ich habe das jetzt mal zu einer 1 geändert...<br>";
            $this->op2 = Numeric::one();
        }
    }

    public function ausgeben() {
        return RationalReal::fractionAusgeben($this->op1->ausgeben() , $this->op2->ausgeben());
    }
    
    public function inlineAusgeben() {
        return ' (' . $this->op1->inlineAusgeben() . " ÷ " . $this->op2->inlineAusgeben() . ") ";
    }

    public function derivative() : FunktionElement {
        return new Division(new Subtraktion(new Multiplikation($this->op1->derivative(), $this->op2), new Multiplikation($this->op1, $this->op2->derivative())), new Potenz($this->op2, Numeric::ofF(2)));
    }

    public function simplified() : FunktionElement {
        $simpler = new self($this->op1->simplified(), $this->op2->simplified());

        if($this->op1 -> isNumeric() && $this->op2 -> isNumeric()) {
            //if($this->op1->getValue() % $this->op2->getValue()->isZero())
                return $this->op1->getValue() -> divideByN( $this->op2->getValue());
        }

        return $this;
    }

    public function getValue() : Numeric
    {
        return $this->op1->getValue()->divideByN($this->op2->getValue());
    }
}

class Potenz extends BinaryOperation {

    public function ausgeben() {
        return "<mrow> <msup> " .  $this->op1->ausgeben() . "\n" . $this->op2->ausgeben() . " </msup> </mrow>";
    }
    
    public function inlineAusgeben() {
        return ' (' . $this->op1->inlineAusgeben() . " ^ " . $this->op2->inlineAusgeben() . ") ";
    }

    public function derivative() : FunktionElement {
        if($this->op2 -> isConstant()) {
            return $this->op2 -> multiply($this->op1 -> toPower($this->op2->subtract(Numeric::one()))) -> multiply($this->op1->derivative());
        } elseif($this->op1 -> equals(Variable::ofName('e'))) {
            return $this->op2->derivative() ->multiply ($this);
        } elseif($this->op1 -> isConstant()) {
            return $this->op2->derivative() -> multiply(new ln($this->op1)) ->multiply ($this);
        } else {
            throw new Exception("Kann nicht folgendes Ableiten: <math>" . $this->ausgeben() ."<\math> weil " . $this->op1->ausgeben() . " nicht numeric ist");
        }
    }

    public function simplified() : FunktionElement {
        $simpler = new self($this->op1->simplified(), $this->op2->simplified());

        if($simpler->op1 -> isNumeric() && $simpler->op2 -> isNumeric()) {
            return $simpler->op1->getValue() -> toPowerN( $simpler->op2->getValue());
        }

        if($simpler->op2 -> isNumeric() && $simpler->op2->isOne()) {
            return $simpler->op1;
        }

        return $simpler;
    }

    public function istQuadratisch() : bool {
        return ($this->op2 -> isConstant()  && $this->op2->getValue()->re() == 2 && $this->op2->getValue()->im() == 0);
    }

    public function gebeBasis() : FunktionElement {
        return $this->op1;
    }

    public function getValue() : Numeric
    {
        return $this->op1->getValue() -> toPowerN( $this->op2->getValue());
    }
}

class Wurzel extends UnaryOperation {

    public function getValue() : Numeric
    {
        return $this->op -> getValue()->sqrtN();
    }

    public function ausgeben() {
        return "<mrow> <msqrt>" .  $this->op->ausgeben() . " </msqrt> </mrow>";
    }

    public function derivative() : FunktionElement {
        return $this -> op -> derivative() -> divideBy((new Numeric(new RationalReal(2))) -> multiply($this));
    }

    public function simplified() : FunktionElement {
        $simpler = new self($this->op->simplified());

        if($simpler->op instanceof Potenz && $simpler->op->istQuadratisch()) {
            return $simpler->op->gebeBasis();
        }

        return $simpler;
    }

    public function isNumeric(): bool
    {
        //TODO: gehört zu Todo ganz oben in dieser Datei
        return false;
    }
}