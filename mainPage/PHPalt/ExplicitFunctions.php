<?php
require_once "Classes.php";

class sqrt extends UnaryOperation {

    public function getValue() : Numeric
    {
        return $this->op -> getValue()->sqrtN();
    }

    public function ausgeben(int $outerPrecedence = 0) : string {
        return "\\sqrt{" .  $this->op->ausgeben(0) . "}";
    }

    public function derivative() : FunktionElement {
        return $this->isConstant() ? Numeric::zero() :  $this -> op -> derivative() -> divideBy(Numeric::two() -> multiply($this));
    }

    public function simplified() : FunktionElement {

        if ($this->isNumeric())
            return $this->getValue();

        $simplerop = $this->op->simplified();

        if($simplerop instanceof Potenz) {
            //TODO stimmt im komplexen nicht immer
            $simplerop->op2 = $simplerop->op2->divideBy(Numeric::two());
            return $simplerop;
        }

        return new self($simplerop);
    }

    public function isNumeric(): bool
    {
        if (! $this->op->isNumeric())
            return false;
        //TODO: wann nicht vereinfachen für Mathematische Exaktheit

        //echo $this->inlineAusgeben() . "=".$this->getValue()->inlineAusgeben();
        if ($this->getValue()->isRational() || ! $this->op->getValue()->isRational())
            return true;
        return false;

    }
}

class cos extends UnaryOperation {

    public function derivative(): FunktionElement
    {
        return $this->isConstant() ? Numeric::zero() : (Numeric::ofF(-1)) -> multiply(new sin($this->op)) -> multiply($this->op->derivative());
    }

    public function getValue() : Numeric
    {
        $v = $this->op->getValue();
        return Numeric::ofF(cos($v->reF()) * cosh($v->imF()), -sin($v->reF()) * sinh($v->imF()));
    }

    public function simplified(): FunktionElement
    {
        $simpler = new self($this->op->simplified());
        if ($simpler->isNumeric())
            return $simpler->getValue();
        // TODO: Implement simplify() method.
        return $simpler;
    }
}

class sin extends UnaryOperation {

    public function derivative(): FunktionElement
    {
        return $this->isConstant() ? Numeric::zero() : (new cos($this->op)) -> multiply($this->op->derivative());
    }

    public function getValue() : Numeric
    {
        $v = $this->op->getValue();
        return Numeric::ofF(sin($v->reF()) * cosh($v->imF()), cos($v->reF()) * sinh($v->imF()));
    }

    public function simplified(): FunktionElement
    {
        $simpler = new self($this->op->simplified());
        if ($simpler->isNumeric())
            return $simpler->getValue();
        // TODO: Implement simplify() method.

        return $simpler;
    }
}

class ln extends UnaryOperation {

    public function derivative(): FunktionElement
    {
        return $this->isConstant() ? Numeric::zero() :  $this->op-> derivative() -> divideBy ($this->op);
    }

    public function getValue() : Numeric
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrigen Logarithmus einführen
        return Numeric::ofF(log($this->op -> getValue()->absSquaredF()) / 2, $this->op->getValue()->argF());
    }

    public function simplified(): FunktionElement
    {
        $simpler = new self($this->op->simplified());
        if ($simpler->isNumeric())
            return $simpler->getValue();

        // TODO: Implement simplify() method.
        return $simpler;
    }
}
