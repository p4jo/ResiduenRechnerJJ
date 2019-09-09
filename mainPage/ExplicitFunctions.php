<?php
require_once "Classes.php";


class cos extends UnaryOperation {

    public function derivative(): FunktionElement
    {
        return (Numeric::ofF(-1)) -> multiply(new sin($this->op)) -> multiply($this->op->derivative());
    }

    public function getValue() : Numeric
    {
        $v = $this->op->getValue();
        return Numeric::ofF(cos($v->reF()) * cosh($v->imF()), -sin($v->reF()) * sinh($v->imF()));
    }

    public function simplified(): FunktionElement
    {
        $simpler = new self($this->op->simplified());
        // TODO: Implement simplify() method.
        return $simpler;
    }
}

class sin extends UnaryOperation {

    public function derivative(): FunktionElement
    {
        return                             (new cos($this->op)) -> multiply($this->op->derivative());
    }

    public function getValue() : Numeric
    {
        $v = $this->op->getValue();
        return Numeric::ofF(sin($v->reF()) * cosh($v->imF()), cos($v->reF()) * sinh($v->imF()));
    }

    public function simplified(): FunktionElement
    {
        $simpler = new self($this->op->simplified());
        // TODO: Implement simplify() method.
        return $simpler;
    }
}

class ln extends UnaryOperation {

    public function derivative(): FunktionElement
    {
        return $this->op-> derivative() -> divideBy ($this->op);
    }

    public function getValue() : Numeric
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrigen Logarithmus einführen
        return Numeric::ofF(log($this->op -> getValue()->absSquaredF()) / 2, $this->op->getValue()->argF());
    }

    public function simplified(): FunktionElement
    {
        $simpler = new self($this->op->simplified());
        // TODO: Implement simplify() method.
        return $simpler;
    }
}
