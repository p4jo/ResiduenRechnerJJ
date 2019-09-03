<?php

class cos extends Funktion {

    public function ableiten($varName): FunktionElement
    {
        return (new Numeric(-1)) -> multiply(new sin($this->op)) -> multiply($this->op[0]->ableiten());
    }
}

class sin extends Funktion {

    public function ableiten($varName): FunktionElement
    {
        return multiply(new cos($this->op)) -> multiply($this->op[0]->ableiten());
    }
}
