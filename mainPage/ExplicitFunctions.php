<?php
require_once "Classes.php";


class cos extends UnaryFunktion {

    public function ableiten(): FunktionElement
    {
        return (Numeric::of(-1)) -> multiply(new sin($this->op)) -> multiply($this->op->ableiten());
    }

    public function getValue() : Numeric
    {
        // TODO: Implement getValue() method für komplexe Werte
        return cos($this->op -> getValue());
    }
}

class sin extends UnaryFunktion {

    public function ableiten(): FunktionElement
    {
        return                             (new cos($this->op)) -> multiply($this->op->ableiten());
    }

    public function getValue() : Numeric
    {
        $v = $this->op->getValue();
        return new Numeric(sin($v->re) * cosh($v->im), cos($v->re) * sinh($v->im));
    }
}

class ln extends UnaryFunktion {

    public function ableiten(): FunktionElement
    {
        return $this->op->ableiten() -> divideBy ($this->op);
    }

    public function getValue() : Numeric
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrigen Logarithmus einführen
        return new Numeric(log($this->op -> getValue()->absSquared()) / 2, $this->op->getValue()->arg());
    }
}
