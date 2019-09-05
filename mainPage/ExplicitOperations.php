<?php
require_once "Classes.php";
require_once "ExplicitFunctions.php";

//Enter any new Operator here. By default Operators are left-grouping within their precedence class, add key
// 'rightAssociative' if meant otherwise
$operations = [
    '+' => ['name' => 'Addition', 'arity' => 2, 'precedence' => 2],
    '-' => ['name' => 'Subtraktion', 'arity' => 2, 'precedence' => 2],
    '/' => ['name' => 'Division', 'arity' => 2, 'precedence' => 3],
    '÷' => ['name' => 'Division', 'arity' => 2, 'precedence' => 3],
    ':' => ['name' => 'Division', 'arity' => 2, 'precedence' => 3],
    '*' => ['name' => 'Multiplikation', 'arity' => 2, 'precedence' => 3],
    '×' => ['name' => 'Multiplikation', 'arity' => 2, 'precedence' => 3],
    '·' => ['name' => 'Multiplikation', 'arity' => 2, 'precedence' => 3],
//    '%' => ['name' => 'RestMod', 'arity' => 2, 'precedence' => 3],
    '^' => ['name' => 'Potenz', 'arity' => 2, 'precedence' => 3, 'rightAssociative' => 1],

    'sin' => ['name' => 'sin', 'arity' => 1],
    'cos' => ['name' => 'cos', 'arity' => 1],
    'ln' => ['name' => 'ln', 'arity' => 1],
    '_' => ['name' => 'minus', 'arity' => 1],
    'ζ' => ['name' => 'RiemannZeta', 'arity' => 1],
    '!' => [ 'name' => 'Factorial', 'arity' => 1], //Pi-Funktion (entschobene Gamma-Funktion) //postfix
];

class Addition extends BinaryOperation {

    public function ausgeben() {
        return "<mrow> " . $this->op1->ausgeben() . "<mo>+</mo>" . $this->op2->ausgeben() . "</mrow> ";
    }

    public function ableiten() : FunktionElement {
        return $this->op1->ableiten() -> add(  $this->op2->ableiten());
    }

    public function simplify() : FunktionElement {
        $this->op1 = $this->op1->simplify();
        $this->op2 = $this->op2->simplify();

        if($this->op1 -> isNumeric() && $this->op2 -> isNumeric()) {
            return $this->op1->getValue() -> addN( $this->op2->getValue());
        }

        //0 kann weg
        if($this->op1 -> isNumeric() && $this->op1->getValue() == 0) {
            return $this->op2;
        }
        if($this->op2 -> isNumeric() && $this->op2->getValue() == 0) {
            return $this->op1;
        }

        //Fall 1
        if($this->op1 -> isNumeric() && ($this->op2 instanceof Addition || $this->op2 instanceof Subtraktion)) {
            $result = 0;
            $op2 = $this->op2->hasNumeric($result);
            if($result != 0) {
                return Numeric::of($this->op1->getValue() + $result) -> add ($op2);
            }
        }

        //Fall 2
        if($this->op2 -> isNumeric() && ($this->op1 instanceof Addition || $this->op1 instanceof Subtraktion)) {
            $result = null;
            $op1 = $this->op1->hasNumeric($result);
            if($result != 0) {
                return $this->op2->getValue() -> addN( $result) -> add ($op1);
            }
        }

        return $this;
    }

    public function hasNumeric(int &$output) {
        if($this->op1 -> isNumeric()) {
            $output = $this->op1->getValue();
            return $this->op2;
        }
        if($this->op2 -> isNumeric()) {
            $output = $this->op2->getValue();
            return $this->op1;
        }

        if($this->op1 instanceof Addition || $this->op1 instanceof Subtraktion) {
            $this->op1 = $this->op1->hasNumeric($output);
            return $this;
        }

        if($this->op2 instanceof Addition || $this->op2 instanceof Subtraktion) {
            $this->op2 = $this->op2->hasNumeric($output);
            return $this;
        }
        return $this;
    }

    public function getValue() : Numeric
    {
        // TODO: Implement getValue() method. für komplexe Werte
    }
}

class Subtraktion extends BinaryOperation {

    public function ausgeben() {
        return "<mrow> " . $this->op1->ausgeben() . "<mo>-</mo>" . $this->op2->ausgeben() . "</mrow> ";
    }

    public function ableiten() : FunktionElement {
        return $this->op1->ableiten() -> subtract ($this->op2->ableiten());
    }

    public function simplify() : FunktionElement {
        $this->op1 = $this->op1->simplify();
        $this->op2 = $this->op2->simplify();

        if($this->op1 -> isNumeric() && $this->op2 -> isNumeric()) {
            return $this->op1->getValue() -> subtractN($this->op2->getValue());
        }

        //Fall 1
        if($this->op1 -> isNumeric() && ($this->op2 instanceof Addition || $this->op2 instanceof Subtraktion)) {
            $result = 0;
            $op2 = $this->op2->hasNumeric($result);
            if($result != 0) {
                return Numeric::of($this->op1->getValue() + $result) -> subtract ($op2);
            }
        }

        //Fall 2
        if($this->op2 -> isNumeric() && ($this->op1 instanceof Addition || $this->op1 instanceof Subtraktion)) {
            $result = 0;
            $op1 = $this->op1->hasNumeric($result);
            if($result != 0) {
                //Todo warum - -? Wenn - => ->negate
                return $op1 -> subtract( -($this->op2->getValue() -> addN ( $result)));
            }
        }

        return $this;
    }


    public function hasNumeric(int &$output) {
        if($this->op1 -> isNumeric()) {
            $output = $this->op1->getValue();
            return $this->op2;
        }
        if($this->op2 -> isNumeric()) {
            $output = $this->op2->getValue();
            return $this->op1;
        }

        if($this->op1 instanceof Addition || $this->op1 instanceof Subtraktion) {
            $this->op1 = $this->op1->hasNumeric($output);
            return $this;
        }

        if($this->op2 instanceof Addition || $this->op2 instanceof Subtraktion) {
            $this->op2 = $this->op2->hasNumeric($output);
            return $this;
        }
        return $this;
    }

    public function getValue() : Numeric
    {
        // TODO: Implement getValue() method. für komplexe Werte
    }
}

class Multiplikation extends BinaryOperation {

    public function ausgeben() {
        return "<mrow> " . $this->op1->ausgeben() . "<mo>&middot;</mo>" . $this->op2->ausgeben() . "</mrow> ";
    }

    public function ableiten() : FunktionElement {
        return
            $this->op1->ableiten() -> multiply($this->op2              ) ->
        add(
            $this->op1->              multiply($this->op2->ableiten()));
    }

    public function simplify() : FunktionElement {
        $this->op1 = $this->op1->simplify();
        $this->op2 = $this->op2->simplify();

        if($this->op1 -> isNumeric() && $this->op2 -> isNumeric()) {
            return Numeric::of($this->op1->getValue() * $this->op2->getValue());
        }

        if($this->op1 -> isNumeric() && $this->op1->getValue() == 0) {
            return Numeric::of(0);
        }
        if($this->op1 -> isNumeric() && $this->op1->getValue() == 1) {
            return $this->op2;
        }

        if($this->op2 -> isNumeric() && $this->op2->getValue() == 0) {
            return Numeric::of(0);
        }
        if($this->op2 -> isNumeric() && $this->op2->getValue() == 1) {
            return $this->op1;
        }
        echo "Nichts vereinfacht (multiplikation) <math>" . $this->ausgeben() . "</math><br>";

        return $this;
    }

    public function getValue() : Numeric
    {
        // TODO: Implement getValue() method. für komplexe Werte
    }
}

class Division extends BinaryOperation {

    public function __construct($op1, $op2){
        parent::__construct($op1, $op2);
        if($this->op2 -> isZero()) {
            echo "\n\nALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!\n";
            echo "ich habe das jetzt mal zu einer 1 geändert...\n\n";
            $this->op2 = Numeric::one();
        }
    }

    public function ausgeben() {
        return "<mrow> <mfrac>" .  $this->op1->ausgeben() . $this->op2->ausgeben() . " </mfrac> </mrow>";
    }

    public function ableiten() : FunktionElement {
        return new Division(new Subtraktion(new Multiplikation($this->op1->ableiten(), $this->op2), new Multiplikation($this->op1, $this->op2->ableiten())), new Potenz($this->op2, Numeric::of(2)));
    }

    public function simplify() : FunktionElement {
        $this->op1 = $this->op1->simplify();
        $this->op2 = $this->op2->simplify();

        if($this->op1 -> isNumeric() && $this->op2 -> isNumeric()) {
            if($this->op1->getValue() % $this->op2->getValue() == 0)
                return Numeric::of($this->op1->getValue() / $this->op2->getValue());
        }

        return $this;
    }

    public function getValue() : Numeric
    {
        // TODO: Implement getValue() method. für komplexe Werte
    }
}

class Potenz extends BinaryOperation {

    public function ausgeben() {
        return "<mrow> " .  $this->op1->ausgeben() . " <msup> " . $this->op2->ausgeben() . " </msup> </mrow>";
    }

    public function ableiten() : FunktionElement {
        if($this->isVarToTheR()) {
            $pot2 = $this->op1 -> toPower($this->op2->subtract(Numeric::one()));
            return $this->op2 -> multiply($pot2);
        } elseif($this->op1 -> equals("e")) {
            return $this->op2->ableiten() ->multiply ($this);
        } elseif($this->op1 -> isNumeric()) {
            return $this->op2->ableiten() -> multiply(new ln($this->op1 -> getValue())) ->multiply ($this);
        } else {
            echo "Kann nicht folgendes Ableiten:" . $this->ausgeben();
        }
    }

    public function simplify() : FunktionElement {
        $this->op1 = $this->op1->simplify();
        $this->op2 = $this->op2->simplify();

        if($this->op1 -> isNumeric() && $this->op2 -> isNumeric()) {
            return $this->op1->getValue() -> toPowerN( $this->op2->getValue());
        }

        if($this->op2 -> isNumeric() && $this->op2->isOne()) {
            return $this->op1;
        }

        return $this;
    }

    public function isVarToTheR() {
        global $workVariable;
        return $this->op1 === $workVariable && $this->op2 -> isConstant();
    }

    public function istQuadratisch() : bool {
        return ($this->op2 -> isConstant()  && $this->op2->getValue() == 2);
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

    public function ableiten() : FunktionElement {
        return $this -> op -> ableiten() -> divideBy($this -> multiply(2)) ;
    }

    public function simplify() : FunktionElement {
        $this->op = $this->op->simplify();

        if($this->op instanceof Potenz && $this->op->istQuadratisch()) {
            return $this->op->gebeBasis();
        }

        return $this;
    }
}