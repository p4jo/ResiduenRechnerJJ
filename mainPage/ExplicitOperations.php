<?php
require_once "Classes.php";
require_once "ExplicitFunctions.php";

//Enter any new Operator here. By default Operators are left-grouping within their precedence class, add key
// 'rightAssociative' if meant otherwise
$operators = [
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
];

class Addition extends Operation {

    public function ausgeben() {
        return "<mrow> " . $this->op[0]->ausgeben() . "<mo>+</mo>" . $this->op[1]->ausgeben() . "</mrow> ";
    }

    public function ableiten($variable) : FunktionElement {
        return $this->op[0]->ableiten($variable).add(  $this->op[1]->ableiten($variable));
    }

    public function vereinfachen($variable) : FunktionElement {
        $this->op[0] = $this->op[0]->vereinfachen();
        $this->op[1] = $this->op[1]->vereinfachen();

        if($this->op[0] -> constant($variable) && $this->op[1] -> constant($variable)) {
            return Numeric::of($this->op[0]->getValue() + $this->op[1]->getValue());
        }

        //0 kann weg
        if($this->op[0] -> constant($variable) && $this->op[0]->getValue() == 0) {
            return $this->op[1];
        }
        if($this->op[1] -> constant($variable) && $this->op[1]->getValue() == 0) {
            return $this->op[0];
        }

        //Fall 1
        if($this->op[0] -> constant($variable) && ($this->op[1] instanceof Addition || $this->op[1] instanceof Subtraktion)) {
            $result = 0;
            $op[1] = $this->op[1]->hasNumeric($result);
            if($result != 0) {
                return Numeric::of($this->op[0]->getValue() + $result) -> add ($op[1]);
            }
        }

        //Fall 2
        if($this->op[1] -> constant($variable) && ($this->op[0] instanceof Addition || $this->op[0] instanceof Subtraktion)) {
            $result = 0;
            $op[0] = $this->op[0]->hasNumeric($result);
            if($result != 0) {
                return Numeric::of($this->op[1]->getValue() + $result) -> add ($op[0]);
            }
        }

        return $this;
    }

    public function hasNumeric(int &$output, $variable) {
        if($this->op[0] -> constant($variable)) {
            $output = $this->op[0]->getValue();
            return $this->op[1];
        }
        if($this->op[1] -> constant($variable)) {
            $output = $this->op[1]->getValue();
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

    public function getValue()
    {
        // TODO: Implement getValue() method. für komplexe Werte
    }
}

class Subtraktion extends Operation {

    public function ausgeben() {
        return "<mrow> " . $this->op[0]->ausgeben() . "<mo>-</mo>" . $this->op[1]->ausgeben() . "</mrow> ";
    }

    public function ableiten($variable) : FunktionElement {
        return $this->op[0]->ableiten() -> subtract ($this->op[1]->ableiten());
    }

    public function vereinfachen($variable) : FunktionElement {
        $this->op[0] = $this->op[0]->vereinfachen($variable);
        $this->op[1] = $this->op[1]->vereinfachen($variable);

        if($this->op[0] -> constant($variable) && $this->op[1] -> constant($variable)) {
            return Numeric::of($this->op[0]->getValue() - $this->op[1]->getValue());
        }

        //Fall 1
        if($this->op[0] -> constant($variable) && ($this->op[1] instanceof Addition || $this->op[1] instanceof Subtraktion)) {
            $result = 0;
            $op[1] = $this->op[1]->hasNumeric($result);
            if($result != 0) {
                return Numeric::of($this->op[0]->getValue() + $result) -> subtract ($op[1]);
            }
        }

        //Fall 2
        if($this->op[1] -> constant($variable) && ($this->op[0] instanceof Addition || $this->op[0] instanceof Subtraktion)) {
            $result = 0;
            $op[0] = $this->op[0]->hasNumeric($result);
            if($result != 0) {
                return $op[0] -> subtract( Numeric::of(-($this->op[1]->getValue() + $result)));
            }
        }

        return $this;
    }


    public function hasNumeric(int &$output, $variable) {
        if($this->op[0] -> constant($variable)) {
            $output = $this->op[0]->getValue();
            return $this->op[1];
        }
        if($this->op[1] -> constant($variable)) {
            $output = $this->op[1]->getValue();
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

    public function getValue()
    {
        // TODO: Implement getValue() method. für komplexe Werte
    }
}

class Multiplikation extends Operation {

    public function ausgeben() {
        return "<mrow> " . $this->op[0]->ausgeben() . "<mo>&middot;</mo>" . $this->op[1]->ausgeben() . "</mrow> ";
    }

    public function ableiten($variable) : FunktionElement {
        return
            $this->op[0]->ableiten() -> multiply($this->op[1]              ) ->
        add(
            $this->op[0]->              multiply($this->op[1]->ableiten()));
    }

    public function vereinfachen($variable) : FunktionElement {
        $this->op[0] = $this->op[0]->vereinfachen($variable);
        $this->op[1] = $this->op[1]->vereinfachen($variable);

        if($this->op[0] -> constant($variable) && $this->op[1] -> constant($variable)) {
            return Numeric::of($this->op[0]->getValue() * $this->op[1]->getValue());
        }

        if($this->op[0] -> constant($variable) && $this->op[0]->getValue() == 0) {
            return Numeric::of(0);
        }
        if($this->op[0] -> constant($variable) && $this->op[0]->getValue() == 1) {
            return $this->op[1];
        }

        if($this->op[1] -> constant($variable) && $this->op[1]->getValue() == 0) {
            return Numeric::of(0);
        }
        if($this->op[1] -> constant($variable) && $this->op[1]->getValue() == 1) {
            return $this->op[0];
        }
        echo "Nichts vereinfacht (multiplikation) <math>" . $this->ausgeben() . "</math><br>";

        return $this;
    }

    public function getValue()
    {
        // TODO: Implement getValue() method. für komplexe Werte
    }
}

class Division extends Operation {

    public function __construct($op){
        parent::__construct($op);
        if($this->op[1] -> isZero()) {
            echo "\n\nALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!\n";
            echo "ich habe das jetzt mal zu einer 1 geändert...\n\n";
            $this->op[1] = Numeric::of(1);
        }
    }

    public function ausgeben() {
        return "<mrow> <mfrac>" .  $this->op[0]->ausgeben() . $this->op[1]->ausgeben() . " </mfrac> </mrow>";
    }

    public function ableiten($variable) : FunktionElement {
        return new Division(new Subtraktion(new Multiplikation($this->op[0]->ableiten($variable), $this->op[1]), new Multiplikation($this->op[0], $this->op[1]->ableiten($variable))), new Potenz($this->op[1], Numeric::of(2)));
    }

    public function vereinfachen($variable) : FunktionElement {
        $this->op[0] = $this->op[0]->vereinfachen();
        $this->op[1] = $this->op[1]->vereinfachen();

        if($this->op[0] -> constant($variable) && $this->op[1] -> constant($variable)) {
            if($this->op[0]->getValue() % $this->op[1]->getValue() == 0)
                return Numeric::of($this->op[0]->getValue() / $this->op[1]->getValue());
        }

        return $this;
    }

    public function getValue()
    {
        // TODO: Implement getValue() method. für komplexe Werte
    }
}

class Potenz extends Operation {

    public function ausgeben() {
        return "<mrow> " .  $this->op[0]->ausgeben() . " <msup> " . $this->op[1]->ausgeben() . " </msup> </mrow>";
    }

    public function ableiten($variable) : FunktionElement {
        if($this->isVarToTheR($variable)) {
            $pot2 = $this->op[0] -> toPower($this->op[1]->subtract(Numeric::one()));
            return $this->op[1] -> multiply($pot2);
        } elseif($this->op[0] instanceof Constant && $this->op[0]->istWert("e")) {
            return $this->op[1]->ableiten() ->multiply ($this);
        } elseif($this->op[0] -> constant($variable)) {
            return $this->op[1]->ableiten() -> multiply(new ln($this->op[0] -> getValue())) ->multiply ($this);
        } else {
            echo "Kann nicht folgendes Ableiten:" . $this->ausgeben();
        }
    }

    public function vereinfachen($variable) : FunktionElement {
        $this->op[0] = $this->op[0]->vereinfachen();
        $this->op[1] = $this->op[1]->vereinfachen();

        if($this->op[0] -> constant($variable) && $this->op[1] -> constant($variable)) {
            return Numeric::of(pow($this->op[0]->getValue(), $this->op[1]->getValue()));
        }

        if($this->op[1] -> constant($variable) && $this->op[1]->isOne()) {
            return $this->op[0];
        }

        return $this;
    }

    public function isVarToTheR($variable) {
        return $this->op[0] === Variable::ofName($variable) && $this->op[1] -> constant($variable);
    }

    public function istQuadratisch($variable) : bool {
        return ($this->op[1] -> constant($variable)  && $this->op[1]->getValue() == 2);
    }

    public function gebeBasis() : FunktionElement {
        return $this->op[0];
    }

    public function getValue()
    {
        // TODO: Implement getValue() method für komplexe Werte
        return pow($this->op[0]->getValue(), $this->op[1]->getValue());
    }
}

class Wurzel extends Operation {

    public function getValue()
    {
        // TODO: Implement getValue() method für komplexe Werte
        return sqrt($this->op[0] -> getValue());
    }

    public function ausgeben() {
        return "<mrow> <msqrt>" .  $this->op[0]->ausgeben() . " </msqrt> </mrow>";
    }

    public function ableiten($variable) : FunktionElement {
        return $this -> op[0] -> ableiten($variable) -> divideBy($this -> multiply(2)) ;
    }

    public function vereinfachen($variable) : FunktionElement {
        $this->op[0] = $this->op[0]->vereinfachen();

        if($this->op[0] instanceof Potenz && $this->op[0]->istQuadratisch($variable)) {
            return $this->op[0]->gebeBasis();
        }

        return $this;
    }
}