<?php
require_once "Classes.php";

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