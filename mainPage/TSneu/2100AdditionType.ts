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


    /**
    * @see FunktionElement.removeVariable
    */
    removeVariable(variable: Variable): FunktionElement {
        this.op1 = this.op1.removeVariable(variable);
        this.op2 = this.op2.removeVariable(variable);
        return this;
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

        this.simplifiedHelperMethod(summands);



        return simpler.simplify();
    }

    /**
     * Vereinfacht das Summanden-Array.
     * Ist eine extra-Methode, weil diese sich selbst so oft aufruft, bis keine Vereinfachung mehr möglich ist.
     */
    simplifiedHelperMethod(summands: [FunktionElement, boolean]) {
        let restart: boolean = false;
        for (let index in summands) {
            //possibly never called....
            if (restart)
                break;
            //1. überprüfe zwei exakt gleiche FunktionElemente
            //Speichere Element, um unnötig viele Zugriffe auf das Array zu verhindern
            let currentData = summands[index];
            let currentElement: FunktionElement = currentData[0];
            for (let index2 in summands) {
                let tempElement: FunktionElement = currentData[index2][0];
                if (restart) {
                    break;
                } else if (currentElement.equals(summands[index2][0])) {
                    //remove both elements from list
                    summands.filter(function (value, index3, arr) {
                        let tempindex: Number = new Number(index);
                        let tempindex2: Number = new Number(index2);
                        return tempindex == index3 || tempindex2 == index3;
                    });
                    //add new element
                    summands.push(new Multiplication(Numeric.ofF(2), currentElement));
                    //must restart now
                    restart = true;
                } else {
                    for (let regVarCount in registeredVariables) {
                        if (restart)
                            break;
                        let regVariable = registeredVariables[regVarCount];
                        let left: FunktionElement = currentElement.isMultipleOf(regVariable);
                        let right: FunktionElement = tempElement.isMultipleOf(regVariable);
                        if (left.isNumeric() && right.isNumeric()) {
                            if (left.getValue().reF() == 0 && right.getValue().reF() == 0) {

                            } else if (left.getValue().imF() == 0 && right.getValue().imF() == 0) {
                                //Look up minimum of both sides
                                let leftIsMin: boolean = true;
                                let min: number = left.getValue().reF();
                                let delta: number = right.getValue().reF() - min;
                                if (right.getValue().reF() < min) {
                                    leftIsMin = false;
                                    min = right.getValue().reF();
                                    delta = -delta;
                                }

                                //remove both elements from list
                                summands.filter(function (value, index3, arr) {
                                    let tempindex: Number = new Number(index);
                                    let tempindex2: Number = new Number(index2);
                                    return tempindex == index3 || tempindex2 == index3;
                                });
                                //add new element
                                if (delta == 0) {
                                    summands.push(new Multiplication(new Addition(currentElement.removeVariable(regVariable), tempElement.removeVariable(regVariable)).simplified(), new Potenz(regVariable, Numeric.ofF(min)).simplified()));
                                } else if (leftIsMin) {
                                    summands.push(new Multiplication(new Addition(currentElement.removeVariable(regVariable), new Multiplication(tempElement.removeVariable(regVariable), new Potenz(regVariable, Numeric.ofF(delta)))).simplified(), new Potenz(regVariable, Numeric.ofF(min)).simplified()));
                                } else {
                                    summands.push(new Multiplication(new Addition(new Multiplication(currentElement.removeVariable(regVariable), new Potenz(regVariable, Numeric.ofF(delta))), tempElement.removeVariable(regVariable)).simplified(), new Potenz(regVariable, Numeric.ofF(min)).simplified()));

                                }
                                summands.push(new Multiplication(Numeric.ofF(2), currentElement));
                                //must restart now
                                restart = true;
                            }
                        }
                    }
                }
            }
            if (restart) {
                this.simplifiedHelperMethod(summands);
            }
        }
    }



    /**
     * @see FunktionElement.isMultipleOf
     * @param variable
     * @unused
     * @broken
     */
    isMultipleOf(variable: Variable): FunktionElement {
        return Numeric.zero;
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
