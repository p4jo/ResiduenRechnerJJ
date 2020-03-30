/**
 * Legt allgemeine Methoden für Summenbasierte Klassen fest.
 * @see Addition
 * @see Subtraktion
 * @author Johannes, Jan
 */
abstract class AdditionType extends BinaryOperation {

    precedence(): number { return 2; }

    constructor(op1: FunktionElement, op2: FunktionElement) {
        super(op1 ?? Numeric.zero, op2 ?? Numeric.zero);
    }



    /**
     * Rework of allSummands()
     * Fügt der übergebenen Liste alle Summanden der tiefer liegenden Additionen (und Subtraktionen) hinzu.
     * Der Wahrheitswert gibt an, ob der Summand positiv (true) oder negativ (false) ist.
     * @param {[FunktionElement, boolean]} list 
     * @author Jan
     */
    getSummands(list: [FunktionElement, boolean]) {
        if (this.op1 instanceof AdditionType) {
            this.op1.getSummands(list);
        } else {
            list.push(this.op1, true);
        }

        if (this.op2 instanceof AdditionType) {
            this.op2.getSummands(list);
        } else {
            list.push(this.op2, this instanceof Addition);
        }
    }


    //TODO vielleicht mit Multiplizität (also [Numeric, [FunktionElement, Numeric][]])
    //Multiplizität über isMultipleOf returning FunktionElement, probably Numeric
    /**
     * Veraltet
     * @deprecated
     */
    allSummands(): [Numeric, FunktionElement[]] //Tupel  //vielleicht speichern 
    {
        let numeric = Numeric.zero;
        let list: FunktionElement[];
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
    /**
     * Wo wird das aufgerufen?
     * @deprecated
     */
    simplify(): FunktionElement {

        //0 kann weg
        if (this.op1.isZero()) {
            if (this instanceof Addition)
                return this.op2;
            return this;
        }
        if (this.op2.isZero()) {
            return this.op1;
        }

        return this;
    }



    //TODO
    isMultipleOf(variable: Variable): FunktionElement {
        return Numeric.zero;
    }
}


/**
 * Repräsentiert eine Addition
 * @see AdditionType
 * @author Johannes, Jan
 */
class Addition extends AdditionType {

    displayInlineNormally(left, right) {
        return left + " + " + right;
    }

    /**
     * Gibt die Ableitung der Funktion zurück
     * @returns FunktionElement
     */
    derivative(): FunktionElement {
        return this.isConstant() ? Numeric.zero : this.op1.derivative().add(this.op2.derivative());
    }

    /**
     * Gibt den numerischen Wert der Summe aus
     * @returns Numeric
     */
    getValue(): Numeric {
        return this.op1.getValue().addN(this.op2.getValue());
    }

    /**
     * Vereinfacht die Summe (z.B. x+x wird zu 2x)
     * @returns FunktionElement
     */
    simplified(): FunktionElement {
        // Todo So sollte jedes Simplified beginnen
        // Edit: Im Allgemeinen, manchmal kann man sich jedoch ein bisschen performance sparen
        let simpler = new Addition(this.op1.simplified(), this.op2.simplified());

        if (simpler.isNumeric()) {
            return simpler.getValue();
        }
        //ENDE so

        //Get all Summands
        let summands: [FunktionElement, boolean];
        this.getSummands(summands);


        for (let index in summands) {
            //1. überprüfe zwei exakt gleiche FunktionElemente
            //Speichere Element, um unnötig viele Zugriffe auf das Array zu verhindern
            let currentData = summands[index];
            let currentElement: FunktionElement = currentData[0];
            for (let index2 in summands) {
                if (currentElement.equals(summands[index2][0])) {
                    summands.filter(function (value, index3, arr) {
                        let tempindex:Number = new Number(index);
                        let tempindex2:Number = new Number(index);
                        return tempindex == index3 || tempindex2 == index3;
                    });
                    summands.push(new Multiplication(Numeric.ofF(2), currentElement));
                }
            }
        }


        return simpler.simplify();
    }
}


/**
 * Repräsentiert eine Subtraktion
 * @see AdditionType
 * @author Johannes, Jan
 */
class Subtraction extends AdditionType {

    displayInlineNormally(left, right) {
        return left + '-' + right;
    }

    derivative(): FunktionElement {
        return this.isConstant() ? Numeric.zero : this.op1.derivative().subtract(this.op2.derivative());
    }

    getValue(): Numeric {
        return this.op1.getValue().subtractN(this.op2.getValue());
    }

    simplified(): FunktionElement {
        // Todo So sollte jedes Simplified beginnen
        let simpler = new Subtraction(this.op1.simplified(), this.op2.simplified());

        if (simpler.isNumeric()) {
            return simpler.getValue();
        }
        //ENDE so

        if (simpler.op1.equals(simpler.op2))
            return Numeric.zero;

        return simpler.simplify();
    }
}
