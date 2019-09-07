<?php
require_once "Classes.php";
require_once "ExplicitFunctions.php";

// TODO: Auch Operationen müssen, wie Variablen nur zu Numerics vereinfacht werden dürfen, wenn das gewünscht ist
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
    '_' => ['name' => 'minus', 'arity' => 1, 'precedence' => 5],
    'ζ' => ['name' => 'RiemannZeta', 'arity' => 1, 'precedence' => 5],
    //Pi-Funktion (entschobene Gamma-Funktion) //postfix
    '!' => [ 'name' => 'Factorial', 'arity' => 1, 'precedence' => 5],
];

class Addition extends BinaryOperation {

    public function ausgeben() {
        if(is_null($this->op1))
            echo"op2 war " .$this->op2->ausgeben();
        return "<mrow> (" . $this->op1->ausgeben() . "<mo>+</mo>" . $this->op2->ausgeben() . ") </mrow> ";
    }

    public function ableiten() : FunktionElement {
        return $this->op1->ableiten() -> add(  $this->op2->ableiten());
    }

    public function simplify() : FunktionElement {
        $simpler = new self($this->op1->simplify(), $this->op2->simplify());

        if($simpler->op1 -> isNumeric() && $simpler->op2 -> isNumeric()) {
            return $simpler->op1->getValue() -> addN( $simpler->op2->getValue());
        }

        //0 kann weg
        if($simpler->op1 -> isNumeric() && $simpler->op1->getValue()->isZero()) {
            return $simpler->op2;
        }
        if($simpler->op2 -> isNumeric() && $simpler->op2->getValue()->isZero()) {
            return $simpler->op1;
        }

        //Fall 1
        if($simpler->op1 -> isNumeric() && ($simpler->op2 instanceof Addition || $simpler->op2 instanceof Subtraktion)) {
            $result = 0;
            $op2 = $simpler->op2->hasNumeric($result);
            if($result != 0) {
                return $simpler->op1->getValue() -> addN ($result) -> add ($op2);
            }
        }

        //Fall 2
        if($simpler->op2 -> isNumeric() && ($simpler->op1 instanceof Addition || $simpler->op1 instanceof Subtraktion)) {
            $result = null;
            $op1 = $simpler->op1->hasNumeric($result);
            if($result != 0) {
                return $simpler->op2->getValue() -> addN( $result) -> add ($op1);
            }
        }

        return $simpler;
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
        return $this->op1->getValue()->addN($this->op2->getValue());
    }
}

class Subtraktion extends BinaryOperation {

    public function ausgeben() {
        return "<mrow> (" . $this->op1->ausgeben() . "<mo>-</mo>" . $this->op2->ausgeben() . ") </mrow> ";
    }

    public function ableiten() : FunktionElement {
        return $this->op1->ableiten() -> subtract ($this->op2->ableiten());
    }

    public function simplify() : FunktionElement {
        $simpler = new self($this->op1->simplify(), $this->op2->simplify());

        if($simpler->op1 -> isNumeric() && $simpler->op2 -> isNumeric()) {
            return $simpler->op1->getValue() -> subtractN($simpler->op2->getValue());
        }

        //Fall 1
        if($simpler->op1 -> isNumeric() && ($simpler->op2 instanceof Addition || $simpler->op2 instanceof Subtraktion)) {
            $result = 0;
            $op2 = $simpler->op2->hasNumeric($result);
            if($result != 0) {
                return $simpler->op1->getValue() -> addN($result) -> subtract ($op2);
            }
        }

        //Fall 2
        if($simpler->op2 -> isNumeric() && ($simpler->op1 instanceof Addition || $simpler->op1 instanceof Subtraktion)) {
            $result = 0;
            $op1 = $simpler->op1->hasNumeric($result);
            if(! $result ->isZero()) {
                //Todo warum - -? Wenn - => ->negate
                return $op1 -> add( ($simpler->op2->getValue() -> addN ( $result)));
            }
        }

        return $simpler;
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
        return $this->op1->getValue()->subtractN($this->op2->getValue());
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
        $simpler = new self($this->op1->simplify(), $this->op2->simplify());

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

    public function ableiten() : FunktionElement {
        return new Division(new Subtraktion(new Multiplikation($this->op1->ableiten(), $this->op2), new Multiplikation($this->op1, $this->op2->ableiten())), new Potenz($this->op2, Numeric::ofF(2)));
    }

    public function simplify() : FunktionElement {
        $simpler = new self($this->op1->simplify(), $this->op2->simplify());

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

    public function ableiten() : FunktionElement {
        if($this->op2 -> isConstant()) {
            return $this->op2 -> multiply($this->op1 -> toPower($this->op2->subtract(Numeric::one()))) -> multiply($this->op1->ableiten());
        } elseif($this->op1 -> equals(Variable::ofName('e'))) {
            return $this->op2->ableiten() ->multiply ($this);
        } elseif($this->op1 -> isConstant()) {
            return $this->op2->ableiten() -> multiply(new ln($this->op1)) ->multiply ($this);
        } else {
            throw new Exception("Kann nicht folgendes Ableiten: <math>" . $this->ausgeben() ."<\math> weil " . $this->op1->ausgeben() . " nicht numeric ist");
        }
    }

    public function simplify() : FunktionElement {
        $simpler = new self($this->op1->simplify(), $this->op2->simplify());

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

    public function ableiten() : FunktionElement {
        return $this -> op -> ableiten() -> divideBy($this -> multiply(2)) ;
    }

    public function simplify() : FunktionElement {
        $simpler = new self($this->op->simplify());

        if($simpler->op instanceof Potenz && $simpler->op->istQuadratisch()) {
            return $simpler->op->gebeBasis();
        }

        return $simpler;
    }
}