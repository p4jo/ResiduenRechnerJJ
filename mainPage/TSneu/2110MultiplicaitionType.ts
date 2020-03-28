

abstract class MultiplicationType extends BinaryOperation {
    
    precedence () { return 3; }

    constructor(op1 : FunktionElement, op2: FunktionElement)
    {
        super(op1 ?? Numeric.one, op2 ?? Numeric.one);
    }

    allFactors() : [Numeric, FunktionElement[]] //Tupel  //vielleicht speichern 
    {
        //TODO
        return null;
    }


    abstract removeVariable(variable : Variable) : FunktionElement;
    
    //TODO: WIE BEI ADDITION
}


class Multiplication extends MultiplicationType {
    displayNormally(left, right)
    {
        return left + '\\cdot ' + right;
    }

    displayInlineNormally(left, right)
    {
        return left + '·' + right;
    }

    derivative() : FunktionElement {
        return this.isConstant() ? Numeric.zero :
        this.op1.derivative() . multiply(this.op2)                . add(
        this.op1.                multiply(this.op2.derivative()));
    }

    simplified() : FunktionElement {
        let simpler = new Multiplication(this.op1.simplified(), this.op2.simplified());

        if (simpler.isNumeric()) {
            return simpler.getValue();
        }
            
        //How do I get variables?
        for (let index in registeredVariables) {
            let currentVariable = registeredVariables[index];
            if((this.op1 instanceof Potenz || this.op1 instanceof MultiplicationType) && (this.op2 instanceof Potenz || this.op2 instanceof MultiplicationType)) {
                let mul1 = this.op1.isMultipleOf(currentVariable);
                let mul2 = this.op1.isMultipleOf(currentVariable);
                if(!mul1.isZero() && !mul2.isZero()) {
                    return new Multiplication(new Potenz(currentVariable, new Addition(mul1, mul2).simplified()), new Multiplication(this.op1.removeVariable(currentVariable), this.op2.removeVariable(currentVariable).simplified()));
                }
            }
        }

        //TODO

        return simpler;
    }

    getValue() : Numeric {
        return this.op1.getValue().multiplyN(this.op2.getValue());
    }

    //Stuff to simplify
    isMultipleOf(variable : Variable) : FunktionElement {
        if(this.op1 == variable || this.op2 == variable) {
            return Numeric.one;
        }
        return Numeric.zero;
    }

    removeVariable(variable : Variable) : FunktionElement {
        if(this.op1 == variable) {
            return this.op2;
        } else if(this.op2 == variable) {
            return this.op1;
        } else {
            if(this.op1 instanceof Potenz || this.op1 instanceof Multiplication || this.op1 instanceof Division){
                this.op1 = this.op1.removeVariable(variable);
            }
            if(this.op2 instanceof Potenz || this.op2 instanceof Multiplication || this.op2 instanceof Division){
                this.op2 = this.op2.removeVariable(variable);
            }
        }
        return this;
    }
}

class Division extends MultiplicationType {

    constructor(op1, op2){
        super(op1, op2);
        if(this.op2 . isZero()) {
            HTMLoutput += "<br>ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!<br>";
            HTMLoutput += "ich habe das jetzt mal zu einer 1 geändert...<br>";
            this.op2 = Numeric.one;
        }
    }

    //Nur wegen Ausnahme bei Bruchstrich + Keine Klammern
    display(outerPrecedence : number = 0) : string {
        if (outerPrecedence > this.precedence())
            return "\\left(" + this.displayNormally(this.op1.display(), this.op2.display()) + "\\right)";
        return this.displayNormally(this.op1.display(), this.op2.display());
    }

    displayNormally(left, right)
    {
        return RationalReal.fractionAusgeben(left, right);
    }

    displayInlineNormally(left, right)
    {
        return left + " ÷ " + right;
    }

    derivative() : FunktionElement {
        return this.isConstant() ? Numeric.zero : new Division(new Subtraction(new Multiplication(this.op1.derivative(), this.op2), new Multiplication(this.op1, this.op2.derivative())), new Potenz(this.op2, Numeric.ofF(2)));
    }

    simplified() : FunktionElement {
        let simpler = new Division(this.op1.simplified(), this.op2.simplified());

        if (simpler.isNumeric())
            return simpler.getValue();

        if (simpler.op1.equals(simpler.op2))
            return Numeric.one;


        return simpler;
    }

    getValue() : Numeric {
        return this.op1.getValue().divideByN(this.op2.getValue());
    }

    //Stuff to simplify
    isMultipleOf(variable : Variable) : FunktionElement {
        if(this.op1 == variable || this.op2 == variable) {
            return Numeric.one;
        }
        return Numeric.zero;
    }

    removeVariable(variable : Variable) : FunktionElement {
        if(this.op1 == variable) {
            return this.op2;
        } else if(this.op2 == variable) {
            return this.op1;
        } else {
            if(this.op1 instanceof Potenz || this.op1 instanceof Multiplication || this.op1 instanceof Division){
                this.op1 = this.op1.removeVariable(variable);
            }
            if(this.op2 instanceof Potenz || this.op2 instanceof Multiplication || this.op2 instanceof Division){
                this.op2 = this.op2.removeVariable(variable);
            }
        }
        return this;
    }
}

class Potenz extends BinaryOperation {
    precedence(): number { return 4; }


    constructor(op1 : FunktionElement, op2 : FunktionElement)
    {
        super(op1 ?? registeredVariables['e'], op2 ?? Numeric.one);
    }

    //Nur wegen Ausnahme bei Hochstellung + Keine Klammer
    display(outerPrecedence : number = 0) : string    {
        let innerPrec = this.precedence();
        if (outerPrecedence >= innerPrec) //Innerhalb dieser Präzedenzklasse muss man klammern
            return "\\left(" + this.displayNormally(this.op1.display(innerPrec), this.op2.display()) + "\\right)";
        return this.displayNormally(this.op1.display(innerPrec), this.op2.display());
    }

    displayInline(outerPrecedence : number = 0) : string    {
        let innerPrec = this.precedence();
        if (outerPrecedence >= innerPrec)
            return "(" + this.displayInlineNormally(this.op1.displayInline(innerPrec), this.op2.displayInline()) + ")";
        return this.displayInlineNormally(this.op1.displayInline(innerPrec), this.op2.displayInline());
    }

    displayNormally(left, right)
    {
        return  left + "^{" + right + "}";
    }

    displayInlineNormally(left, right)
    {
        return  left + "^(" + right + ")";
    }


    derivative() : FunktionElement {
        if (this.isConstant())  return Numeric.zero;
        if (this.op2 . isConstant()) {
            return this.op2 . multiply(this.op1 . toPower(this.op2.subtract(Numeric.one))) . multiply(this.op1.derivative());
        } else if(this.op1 . equals(Variable.ofName('e'))) {
            return this.op2.derivative() .multiply (this);
        } else if(this.op1 . isConstant()) {
            return this.op2.derivative() . multiply(new ln(this.op1)) .multiply (this);
        } else {
            return this.multiply(
                (new ln(this.op1)).multiply(this.op2.derivative()) . add(
                this.op1.derivative().divideBy(this.op1).multiply(this.op2))
            );
        }
    }

    simplified() : FunktionElement {
        let simpler = new Potenz(this.op1.simplified(), this.op2.simplified());

        if(simpler.isNumeric()) {
            return simpler.getValue();
        }

        if (simpler.op2.isZero())
            return Numeric.one;
        if(simpler.op1.isZero())
            return Numeric.zero;
        if (simpler.op1.isOne())
            return Numeric.one;
        if(simpler.op2.isOne())
            return simpler.op1;

        return simpler;
    }

    getValue() : Numeric {
        return this.op1.getValue() . toPowerN( this.op2.getValue());
    }


    //Stuff to simplify
    isMultipleOf(variable : Variable) : FunktionElement {
        if(this.op1 == variable) {
            if(this.op2.isNumeric) {
                return this.op2.getValue();
            }
        }
        return Numeric.zero;
    }

    removeVariable(variable : Variable) : FunktionElement {
        if(this.op1 == variable) {
            return this.op2;
        } else if(this.op2 == variable) {
            return this.op1;
        } else {
            if(this.op1 instanceof Potenz || this.op1 instanceof Multiplication || this.op1 instanceof Division){
                this.op1 = this.op1.removeVariable(variable);
            }
            if(this.op2 instanceof Potenz || this.op2 instanceof Multiplication || this.op2 instanceof Division){
                this.op2 = this.op2.removeVariable(variable);
            }
        }
        return this;
    }
}
