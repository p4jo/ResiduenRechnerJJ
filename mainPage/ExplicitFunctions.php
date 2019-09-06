<?php
require_once "Classes.php";


class cos extends UnaryOperation {

    public function ableiten(): FunktionElement
    {
        return (new RationalNumber(-1)) -> multiply(new sin($this->op)) -> multiply($this->op->ableiten());
    }

    public function getValue() : Numeric
    {
        $v = $this->op->getValue();
        return new FloatyNumber(cos($v->re()) * cosh($v->im()), -sin($v->re()) * sinh($v->im()));
    }

    public function simplify(): FunktionElement
    {
        $simpler = new self($this->op->simplify());
        // TODO: Implement simplify() method.

    }
}

class sin extends UnaryOperation {

    public function ableiten(): FunktionElement
    {
        return                             (new cos($this->op)) -> multiply($this->op->ableiten());
    }

    public function getValue() : Numeric
    {
        $v = $this->op->getValue();
        return new FloatyNumber(sin($v->re()) * cosh($v->im()), cos($v->re()) * sinh($v->im()));
    }

    public function simplify(): FunktionElement
    {
        $simpler = new self($this->op->simplify());
        // TODO: Implement simplify() method.
    }
}

class ln extends UnaryOperation {

    public function ableiten(): FunktionElement
    {
        return $this->op->ableiten() -> divideBy ($this->op);
    }

    public function getValue() : Numeric
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrigen Logarithmus einführen
        return new FloatyNumber(log($this->op -> getValue()->absSquared()) / 2, $this->op->getValue()->arg());
    }

    public function simplify(): FunktionElement
    {
        $simpler = new self($this->op->simplify());
        // TODO: Implement simplify() method.
    }
}
