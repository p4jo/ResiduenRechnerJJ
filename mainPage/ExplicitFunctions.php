<?php
require_once "Classes.php";


class cos extends UnaryOperation {

    public function ableiten(): FunktionElement
    {
        return (Numeric::ofF(-1)) -> multiply(new sin($this->op)) -> multiply($this->op->ableiten());
    }

    public function getValue() : Numeric
    {
        $v = $this->op->getValue();
        return Numeric::ofF(cos($v->reF()) * cosh($v->imF()), -sin($v->reF()) * sinh($v->imF()));
    }

    public function simplify(): FunktionElement
    {
        $simpler = new self($this->op->simplify());
        // TODO: Implement simplify() method.
        return $simpler;
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
        return Numeric::ofF(sin($v->reF()) * cosh($v->imF()), cos($v->reF()) * sinh($v->imF()));
    }

    public function simplify(): FunktionElement
    {
        $simpler = new self($this->op->simplify());
        // TODO: Implement simplify() method.
        return $simpler;
    }
}

class ln extends UnaryOperation {

    public function ableiten(): FunktionElement
    {
        return $this->op-> ableiten() -> divideBy ($this->op);
    }

    public function getValue() : Numeric
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrigen Logarithmus einführen
        return Numeric::ofF(log($this->op -> getValue()->absSquaredF()) / 2, $this->op->getValue()->argF());
    }

    public function simplify(): FunktionElement
    {
        $simpler = new self($this->op->simplify());
        // TODO: Implement simplify() method.
        return $simpler;
    }
}
