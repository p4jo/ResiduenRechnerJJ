
abstract class AdditionType extends BinaryOperation {

    precedence(): number
    {
        return 2;
    }

    constructor(op1 : FunktionElement, op2 : FunktionElement)
    {
        super(op1 ?? Numeric.zero, op2 ?? Numeric.zero);
    }

    //Mit Multiplizität
    allSummands() : [Numeric, FunktionElement[]] //Tupel  //vielleicht speichern 
    {
        let numeric = Numeric.zero;
        let list : FunktionElement[]; 
        if (this.op1.isNumeric()) 
            numeric = this.op1.getValue();
        else if (this.op1 instanceof AdditionType)
            [numeric, list] = this.op1.allSummands();
        else if (this.op1 instanceof MultiplicationType) {
            var factors = this.op1.allFactors();
            //TODO Rest
            list.push(this.op1);
        }
        //else
          //  output{this.op1, Numeric.one};

        if (this.op2.isNumeric()) {
            if (this instanceof Addition)
                numeric = numeric.addN(this.op2.getValue());
            else
                numeric = numeric.subtractN(this.op2.getValue());
        }
        else if (this.op2 instanceof AdditionType) {
            if (this instanceof Addition)
                numeric = numeric.addN(this.op2.getValue());
            else
                numeric = numeric.subtractN(this.op2.getValue());
            list = list.concat((this.op2 as AdditionType).allSummands()[1]);
        }
        else
            list.push(this.op2);

        return [numeric, list];
    }

    //Soll allSummands benutzen
    simplify() : FunktionElement {

        //0 kann weg
        if(this.op1.isZero()) {
            if (this instanceof Addition)
                return this.op2;
            return this;
        }
        if(this.op2.isZero()) {
            return this.op1;
        }
/*  TODO 
        //Fall 1
        if(this.op2 instanceof AdditionType && this.op1.isNumeric()) {
            let result = null;
            let simplerop2 = this.op2.extractNumeric(result);
            if (result instanceof Numeric && !result.isZero()) {
                return this instanceof Addition ?
                    //TODO korrigieren, vielleicht wieder aufspalten auf Untertypen
                    this.op1.getValue() . addN (result) . add (simplerop2) :
                    this.op1.getValue() . subtractN (result) . add (simplerop2);
            }
        }

        //Fall 2
        if(this.op1 instanceof AdditionType && this.op2 . isNumeric()) {
            let result = null;
            let simplerop1 = this.op1.extractNumeric(result);
            if (result instanceof Numeric && !result.isZero()) {
                return this instanceof Addition ?
                    this.op2.getValue() . addN (result) . add (simplerop1) :
                    this.op2.getValue() . subtractN (result) . add (simplerop1);
            }
        }
*/
        return this;
    }
}

class Addition extends AdditionType {

    displayInlineNormally(left, right) {
        return left + " + " + right;
    }

    derivative() : FunktionElement {
        return this.isConstant() ? Numeric.zero : this.op1.derivative() . add(this.op2.derivative());
    }


    getValue() : Numeric
    {
        return this.op1.getValue().addN(this.op2.getValue());
    }

    simplified(): FunktionElement
    {
        // Todo So sollte jedes Simplified beginnen
        let simpler = new Addition(this.op1.simplified(), this.op2.simplified());

        if(simpler.isNumeric()) {
            return simpler.getValue();
        }
        //ENDE so
        return simpler.simplify();
    }
}

class Subtraction extends AdditionType {

    displayInlineNormally(left, right)
    {
        return left + '-' + right;
    }

    derivative() : FunktionElement {
        return this.isConstant() ? Numeric.zero : this.op1.derivative().subtract (this.op2.derivative());
    }

    getValue() : Numeric
    {
        return this.op1.getValue().subtractN(this.op2.getValue());
    }

    simplified(): FunktionElement
    {
        // Todo So sollte jedes Simplified beginnen
        let simpler = new Subtraction(this.op1.simplified(), this.op2.simplified());

        if(simpler.isNumeric()) {
            return simpler.getValue();
        }
        //ENDE so

        if (simpler.op1.equals(simpler.op2))
            return Numeric.zero;

        return simpler.simplify();
    }
}


abstract class MultiplicationType extends BinaryOperation {
    constructor(op1 : FunktionElement, op2: FunktionElement)
    {
        super(op1 ?? Numeric.one, op2 ?? Numeric.one);
    }

    allFactors() : [Numeric, FunktionElement[]] //Tupel  //vielleicht speichern 
    {
        //TODO
        return null;
    }

    //TODO: WIE BEI ADDITION
}


class Multiplikation extends MultiplicationType {
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
        let simpler = new Multiplikation(this.op1.simplified(), this.op2.simplified());

        if (simpler.isNumeric())
            return simpler.getValue();

        if(simpler.op1 . isNumeric() && simpler.op1.isZero()) {
            return Numeric.zero;
        }
        if(simpler.op1 . isNumeric() && simpler.op1.isOne()) {
            return simpler.op2;
        }

        if(simpler.op2 . isNumeric() && simpler.op2.isZero()) {
            return Numeric.zero;
        }
        if(simpler.op2 . isNumeric() && simpler.op2.isOne()) {
            return simpler.op1;
        }
        //result += "Nichts vereinfacht (multiplikation) <math>" . simpler.ausgeben() . "</math><br>";
        //TODO
        return simpler;
    }

    getValue() : Numeric
    {
        return this.op1.getValue().multiplyN(this.op2.getValue());
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
        return this.isConstant() ? Numeric.zero : new Division(new Subtraction(new Multiplikation(this.op1.derivative(), this.op2), new Multiplikation(this.op1, this.op2.derivative())), new Potenz(this.op2, Numeric.ofF(2)));
    }

    simplified() : FunktionElement {
        let simpler = new Division(this.op1.simplified(), this.op2.simplified());

        if (simpler.isNumeric())
            return simpler.getValue();

        if (simpler.op1.equals(simpler.op2))
            return Numeric.one;


        return simpler;
    }

    getValue() : Numeric
    {
        return this.op1.getValue().divideByN(this.op2.getValue());
    }
}

class Potenz extends BinaryOperation {
    precedence(): number
    { return 4; }


    //Nur wegen Ausnahme bei Hochstellung + Keine Klammer
    display(outerPrecedence : number = 0) : string    {
        let innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "\\left(" + this.displayNormally(this.op1.display(innerPrec), this.op2.display()) + "\\right)";
        return this.displayNormally(this.op1.display(innerPrec), this.op2.display());
    }

    displayInline(outerPrecedence : number = 0) : string    {
        let innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
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

    getValue() : Numeric
    {
        return this.op1.getValue() . toPowerN( this.op2.getValue());
    }
}
