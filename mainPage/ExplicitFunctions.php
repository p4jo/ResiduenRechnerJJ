<?php
require_once "Classes.php";

class cos extends Funktion {

    public const arity = 1;
    public function ableiten($variable): FunktionElement
    {
        return (Numeric::of(-1)) -> multiply(new sin($this->op)) -> multiply($this->op[0]->ableiten());
    }

    public function getValue()
    {
        // TODO: Implement getValue() method für komplexe Werte
        return cos($this->op[0] -> getValue());
    }
}

class sin extends Funktion {

    public const arity = 1;
    public function ableiten($variable): FunktionElement
    {
        return                             (new cos($this->op)) -> multiply($this->op[0]->ableiten());
    }

    public function getValue()
    {
        // TODO: Implement getValue() method für komplexe Werte
        return cos($this->op[0] -> getValue());
    }
}

class ln extends Funktion {

    public const arity = 1;
    public function ableiten($variable): FunktionElement
    {
        return multiply($this->op[0]->ableiten()) -> divideBy ($variable);
    }

    public function getValue()
    {
        // TODO: Implement getValue() method für komplexe Werte
        return cos($this->op[0] -> getValue());
    }
}
