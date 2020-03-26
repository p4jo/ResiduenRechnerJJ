
abstract class AdditionType extends BinaryOperation {

    precedence() : number { return 2; }

    constructor(op1 : FunktionElement, op2 : FunktionElement)
    {
        super(op1 ?? Numeric.zero, op2 ?? Numeric.zero);
    }

    //TODO vielleicht mit Multiplizität (also [Numeric, [FunktionElement, Numeric][]])
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
            const summ = this.op2.allSummands();
            if (this instanceof Addition)
                numeric = numeric.addN(summ[0]);
            else
                numeric = numeric.subtractN(summ[0]);
            list = list.concat(summ[1]);
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
