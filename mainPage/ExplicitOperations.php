<?php
require_once "Classes.php";
require_once "ExplicitFunctions.php";

abstract class AdditionType extends BinaryOperation {

    public function precedence(): int
    {
        return 2;
    }

    public function __construct(?FunktionElement $op1,?FunktionElement $op2)
    {
        parent::__construct($op1 ?? Numeric::zero(), $op2 ?? Numeric::zero());
    }

    public function extractNumeric(?Numeric &$output) {
        if($this->op1 -> isNumeric()) {
            $output = $this->op1->getValue();
            return $this->op2;
        }
        if($this->op2 -> isNumeric()) {
            $output = $this->op2->getValue();
            return $this->op1;
        }

        if($this->op1 instanceof AdditionType) {
            //TOdo Immutable
            $this->op1 = $this->op1->extractNumeric($output);
            //new self($this->op1->extractNumeric($output),$this->op2);
            return $this;
        }

        if($this->op2 instanceof AdditionType) {
            $this->op2 = $this->op2->extractNumeric($output);
            return $this;
        }
        return $this;
    }

    //Mit Multiplizität
    public function allSummands() : array
    {
        if ($this->op1->isNumeric()) 
            $output['n'] = $this->op1->getValue();
        elseif ($this->op1 instanceof AdditionType)
            $output = $this->op1->allSummands();
        elseif ($this->op1 instanceof MultiplicationType) {
            $factors = $this->op1->allFactors();
            //TODO rest
            $output[] = [$factors["REST"], $factors['n']];
        }
        else
            $output[] = [$this->op1, Numeric::one()];

        if ($this->op2->isNumeric()) {
            if ($this instanceof Addition)
                $output['n'] = isset($output['n']) ? $output['n'] ->addN($this->op2->getValue()) : $this->op2->getValue();
            else
                $output['n'] = isset($output['n']) ? $output['n'] ->subtractN($this->op2->getValue()) : $this->op2->getValue()->negativeN();
        }
        elseif ($this->op2 instanceof AdditionType) {
            if ($this instanceof Addition)
                $output['n'] = isset($output['n']) ? $output['n']->addN($this->op2->getValue()) : $this->op2->getValue();
            else
                $output['n'] = isset($output['n']) ? $output['n']->subtractN($this->op2->getValue()) : $this->op2->getValue()->negativeN();
            $output = array_merge($this->op2->allSummands(), $output);
        }
        else
            $output[] = [$this->op2, $this instanceof Addition ? Numeric::one() : Numeric::one()->negativeN()];

        return $output;
    }

    public function simplify($instance) : FunktionElement {

        //0 kann weg
        if($instance->op1->isZero()) {
            if ($this instanceof Addition)
                return $instance->op2;
            return $instance;
        }
        if($instance->op2->isZero()) {
            return $instance->op1;
        }

        //Fall 1
        if($instance->op2 instanceof AdditionType && $instance->op1 -> isNumeric()) {
            $result = null;
            $simplerop2 = $instance->op2->extractNumeric($result);
            if ($result instanceof Numeric && !$result->isZero()) {
                return $this instanceof Addition ?
                    //TODO korrigieren, vielleicht wieder aufspalten auf Untertypen
                    $instance->op1->getValue() -> addN ($result) -> add ($simplerop2) :
                    $instance->op1->getValue() -> subtractN ($result) -> add ($simplerop2);
            }
        }

        //Fall 2
        if($instance->op1 instanceof AdditionType && $instance->op2 -> isNumeric()) {
            $result = null;
            $simplerop1 = $instance->op1->extractNumeric($result);
            if ($result instanceof Numeric && !$result->isZero()) {
                return $this instanceof Addition ?
                    $instance->op2->getValue() -> addN ($result) -> add ($simplerop1) :
                    $instance->op2->getValue() -> subtractN ($result) -> add ($simplerop1);
            }
        }

        return $instance;
    }
}

class Addition extends AdditionType {

    public function normalInlineAusgeben($left, $right) {
        return $left . " + " . $right;
    }

    public function derivative() : FunktionElement {
        return $this->isConstant() ? Numeric::zero() : $this->op1->derivative() -> add(  $this->op2->derivative());
    }


    public function getValue() : Numeric
    {
        return $this->op1->getValue()->addN($this->op2->getValue());
    }

    public function simplified(): FunktionElement
    {
        // Todo So sollte jedes Simplified beginnen
        $simpler = new self($this->op1->simplified(), $this->op2->simplified());

        if($simpler->isNumeric()) {
            return $simpler->getValue();
        }
        //ENDE so
        return parent::simplify($simpler);
    }
}

class Subtraktion extends AdditionType {

    public function normalInlineAusgeben($left, $right)
    {
        return $left. '-' . $right;
    }

    public function derivative() : FunktionElement {
        return $this->isConstant() ? Numeric::zero() : $this->op1->derivative() -> subtract ($this->op2->derivative());
    }

    public function getValue() : Numeric
    {
        return $this->op1->getValue()->subtractN($this->op2->getValue());
    }

    public function simplified(): FunktionElement
    {
        // Todo So sollte jedes Simplified beginnen
        $simpler = new self($this->op1->simplified(), $this->op2->simplified());

        if($simpler->isNumeric()) {
            return $simpler->getValue();
        }
        //ENDE so

        if ($simpler->op1->equals($simpler->op2))
            return Numeric::zero();

        return parent::simplify($simpler);
    }
}
abstract class MultiplicationType extends BinaryOperation {
    public function __construct(?FunktionElement $op1,?FunktionElement $op2)
    {
        parent::__construct($op1 ?? Numeric::one(), $op2 ?? Numeric::one());
    }

    public function allFactors() : array {

    }
}


class Multiplikation extends MultiplicationType {
    public function normalAusgeben($left, $right)
    {
        return $left . '\\cdot ' . $right;
    }

    public function normalInlineAusgeben($left, $right)
    {
        return $left . '·' . $right;
    }

    public function derivative() : FunktionElement {
        return $this->isConstant() ? Numeric::zero() :
        $this->op1->derivative() -> multiply($this->op2)                -> add(
        $this->op1->                multiply($this->op2->derivative()));
    }

    public function simplified() : FunktionElement {
        $simpler = new self($this->op1->simplified(), $this->op2->simplified());

        if ($simpler->isNumeric())
            return $simpler->getValue();

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
        //TODO
        return $simpler;
    }

    public function getValue() : Numeric
    {
        return $this->op1->getValue()->multiplyN($this->op2->getValue());
    }
}

class Division extends MultiplicationType {

    public function __construct($op1, $op2){
        parent::__construct($op1, $op2);
        if($this->op2 -> isZero()) {
            echo "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
            echo "ich habe das jetzt mal zu einer 1 geändert...<br>";
            $this->op2 = Numeric::one();
        }
    }

    //Nur wegen Ausnahme bei Bruchstrich -> Keine Klammern
    public function ausgeben(int $outerPrecedence = 0) : string    {
        $innerPrec = $this->precedence();
        if ($outerPrecedence > $innerPrec)
            return "\\left(" . $this->normalAusgeben($this->op1->ausgeben(), $this->op2->ausgeben()) . "\\right)";
        return $this->normalAusgeben($this->op1->ausgeben(), $this->op2->ausgeben());
    }

    public function normalAusgeben($left, $right)
    {
        return RationalReal::fractionAusgeben($left, $right);
    }

    public function normalInlineAusgeben($left, $right)
    {
        return $left . " ÷ " . $right;
    }

    public function derivative() : FunktionElement {
        return $this->isConstant() ? Numeric::zero() : new Division(new Subtraktion(new Multiplikation($this->op1->derivative(), $this->op2), new Multiplikation($this->op1, $this->op2->derivative())), new Potenz($this->op2, Numeric::ofF(2)));
    }

    public function simplified() : FunktionElement {
        $simpler = new self($this->op1->simplified(), $this->op2->simplified());

        if ($simpler->isNumeric())
            return $simpler->getValue();

        if ($simpler->op1->equals($simpler->op2))
            return Numeric::one();


        return $simpler;
    }

    public function getValue() : Numeric
    {
        return $this->op1->getValue()->divideByN($this->op2->getValue());
    }
}

class Potenz extends BinaryOperation {
    function precedence(): int
    { return 4; }


    //Nur wegen Ausnahme bei Hochstellung -> Keine Klammer
    public function ausgeben(int $outerPrecedence = 0) : string    {
        $innerPrec = $this->precedence();
        if ($outerPrecedence > $innerPrec)
            return "\\left(" . $this->normalAusgeben($this->op1->ausgeben($innerPrec), $this->op2->ausgeben()) . "\\right)";
        return $this->normalAusgeben($this->op1->ausgeben($innerPrec), $this->op2->ausgeben());
    }

    public function normalAusgeben($left, $right)
    {
        return  $left . "^{" . $right . "}";
    }

    public function normalInlineAusgeben($left, $right)
    {
        return  $left . "^(" . $right . ")";
    }


    public function derivative() : FunktionElement {
        if ($this->isConstant())  return Numeric::zero();
        if ($this->op2 -> isConstant()) {
            return $this->op2 -> multiply($this->op1 -> toPower($this->op2->subtract(Numeric::one()))) -> multiply($this->op1->derivative());
        } elseif($this->op1 -> equals(Variable::ofName('e'))) {
            return $this->op2->derivative() ->multiply ($this);
        } elseif($this->op1 -> isConstant()) {
            return $this->op2->derivative() -> multiply(new ln($this->op1)) ->multiply ($this);
        } else {
            return $this->multiply(
                (new ln($this->op1))->multiply($this->op2->derivative()) -> add(
                $this->op1->derivative()->divideBy($this->op1)->multiply($this->op2))
            );
        }
    }

    public function simplified() : FunktionElement {
        $simpler = new self($this->op1->simplified(), $this->op2->simplified());

        if($simpler->isNumeric()) {
            return $simpler->getValue();
        }

        if ($simpler->op2->isZero())
            return Numeric::one();
        if($simpler->op1->isZero())
            return Numeric::zero();
        if ($simpler->op1->isOne())
            return Numeric::one();
        if($simpler->op2->isOne())
            return $simpler->op1;

        return $simpler;
    }

    public function getValue() : Numeric
    {
        return $this->op1->getValue() -> toPowerN( $this->op2->getValue());
    }
}
