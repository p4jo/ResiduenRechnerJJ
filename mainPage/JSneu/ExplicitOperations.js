
//es gibt nur abstrakte sub-klassen, das funktioniert aber (meines wissens nach) nicht in diesem Kontext.
//abstract class AdditionType extends BinaryOperation {

//Ich habe in der Tat keine Ahnung, was ich jetzt im Nachfolgenden schreibe.
//Beispiel abstrakte sub-klasse: ()
/*
var AdditionType = Base => class extends BinaryOperation {
  rechne() { }
};

//ACHTUNG: Diese klasse (AdditionType) würde im Konstruktor ein Kind von BinaryOperation erwarten, selber aber keines sein.
//Deshalb geht das nicht.
*/


//Deshalb:
class AdditionType extends BinaryOperation {


    get precedence() {
        return 2;
    }

    constructor(op1, op2) {
        super(op1, op2);
    }

    get extractNumeric(output) {
        if(this.op1.isNumeric()) {
            output = this.op1.getValue();
            return this.op2;
        }
        if(this.op2.isNumeric()) {
            output = this.op2.getValue();
            return this.op1;
        }

        if(this.op1 instanceof AdditionType) {
            //TOdo Immutable
            this.op1 = this.op1.extractNumeric(output);
            //new self(this.op1.extractNumeric(output),this.op2);
            return this;
        }

        if(this.op2 instanceof AdditionType) {
            this.op2 = this.op2.extractNumeric(output);
            return this;
        }
        return this;
    }

    //Mit Multiplizität
    get allSummands() {
        var output;
        if (this.op1.isNumeric()) 
            output['n'] = this.op1.getValue();
        else if (this.op1 instanceof AdditionType)
            output = this.op1.allSummands();
        else if (this.op1 instanceof MultiplicationType) {
            factors = this.op1.allFactors();
            //TODO rest
            output = [factors["REST"], factors['n']];
        } else {
            output = [this.op1, Numeric.one()];
        }

        if (this.op2.isNumeric()) {
            if (this instanceof Addition)
                output['n'] = isset(output['n']) ? output['n'] .addN(this.op2.getValue()) : this.op2.getValue();
            else
                output['n'] = isset(output['n']) ? output['n'] .subtractN(this.op2.getValue()) : this.op2.getValue().negativeN();
        }
        else if (this.op2 instanceof AdditionType) {
            if (this instanceof Addition)
                output['n'] = isset(output['n']) ? output['n'].addN(this.op2.getValue()) : this.op2.getValue();
            else
                output['n'] = isset(output['n']) ? output['n'].subtractN(this.op2.getValue()) : this.op2.getValue().negativeN();
            output = array_merge(this.op2.allSummands(), output);
        }
        else
        //TODO
            output = [this.op2, this instanceof Addition ? Numeric.one().negativeN() : Numeric.one() /*???*/ ];

        return output;
    }

    get simplify(instance) {

        //0 kann weg
        if(instance.op1.isZero()) {
            if (this instanceof Addition)
                return instance.op2;
            return instance;
        }
        if(instance.op2.isZero()) {
            return instance.op1;
        }

        //Fall 1
        if(instance.op2 instanceof AdditionType && instance.op1 + isNumeric()) {
            result = null;
            simplerop2 = instance.op2.extractNumeric(result);
            if (result instanceof Numeric && !result.isZero()) {
                return this instanceof Addition ?
                    //TODO korrigieren, vielleicht wieder aufspalten auf Untertypen
                    instance.op1.getValue() + addN (result) + add (simplerop2) :
                    instance.op1.getValue() + subtractN (result) + add (simplerop2);
            }
        }

        //Fall 2
        if(instance.op1 instanceof AdditionType && instance.op2 + isNumeric()) {
            result = null;
            simplerop1 = instance.op1.extractNumeric(result);
            if (result instanceof Numeric && !result.isZero()) {
                return this instanceof Addition ?
                    instance.op2.getValue() + addN (result) + add (simplerop1) :
                    instance.op2.getValue() + subtractN (result) + add (simplerop1);
            }
        }

        return instance;
    }
}

class Addition extends AdditionType {

    get normalInlineAusgeben(left, right) {
        return left + " + " + right;
    }

    get derivative() {
        return this.isConstant() ? Numeric.zero() : this.op1.derivative() + add(  this.op2.derivative());
    }


    get getValue() {
        return this.op1.getValue().addN(this.op2.getValue());
    }

    get simplified() {
        // Todo So sollte jedes Simplified beginnen
        simpler = new self(this.op1.simplified(), this.op2.simplified());

        if(simpler.isNumeric()) {
            return simpler.getValue();
        }
        //ENDE so
        return simplify(simpler);
    }
}

class Subtraktion extends AdditionType {

    get normalInlineAusgeben(left, right)
    {
        return left + '-' + right;
    }

    get derivative() {
        return this.isConstant() ? Numeric.zero() : this.op1.derivative() + subtract (this.op2.derivative());
    }

    get getValue() {
        return this.op1.getValue().subtractN(this.op2.getValue());
    }

    get simplified() {
        // Todo So sollte jedes Simplified beginnen
        simpler = new self(this.op1.simplified(), this.op2.simplified());

        if(simpler.isNumeric()) {
            return simpler.getValue();
        }
        //ENDE so

        if (simpler.op1.equals(simpler.op2))
            return Numeric.zero();

        return parent.simplify(simpler);
    }
}


class MultiplicationType extends BinaryOperation {
    get __construct(op1, op2) {
        super(op1, op2);
    }

    get allFactors() {

    }
}


class Multiplikation extends MultiplicationType {
    get normalAusgeben(left, right)
    {
        return left + '\\cdot ' + right;
    }

    get normalInlineAusgeben(left, right)
    {
        return left + '·' + right;
    }

    get derivative() {
        return this.isConstant() ? Numeric.zero() :
        this.op1.derivative() + multiply(this.op2)                + add(
        this.op1.                multiply(this.op2.derivative()));
    }

    get simplified() {
        simpler = new self(this.op1.simplified(), this.op2.simplified());

        if (simpler.isNumeric())
            return simpler.getValue();

        if(simpler.op1 + isNumeric() && simpler.op1.isZero()) {
            return Numeric.zero();
        }
        if(simpler.op1 + isNumeric() && simpler.op1.isOne()) {
            return simpler.op2;
        }

        if(simpler.op2 + isNumeric() && simpler.op2.isZero()) {
            return Numeric.zero();
        }
        if(simpler.op2 + isNumeric() && simpler.op2.isOne()) {
            return simpler.op1;
        }
        //echo "Nichts vereinfacht (multiplikation) <math>" + simpler.ausgeben() + "</math><br>";
        //TODO
        return simpler;
    }

    get getValue() {
        return this.op1.getValue().multiplyN(this.op2.getValue());
    }
}

class Division extends MultiplicationType {

    get __construct(op1, op2){
        super(op1, op2);
        if(this.op2.isZero()) {
            alert("ALARM! ERROR! Beim Teilen durch 0 überhitzt meine CPU!, ich habe das jetzt mal zu einer 1 geändert...");
            this.op2 = Numeric.one();
        }
    }

    //Nur wegen Ausnahme bei Bruchstrich + Keine Klammern
    get ausgeben(outerPrecedence = 0) {
        innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "\\left(" + this.normalAusgeben(this.op1.ausgeben(), this.op2.ausgeben()) + "\\right)";
        return this.normalAusgeben(this.op1.ausgeben(), this.op2.ausgeben());
    }

    get normalAusgeben(left, right)
    {
        return RationalReal.fractionAusgeben(left, right);
    }

    get normalInlineAusgeben(left, right)
    {
        return left + " ÷ " + right;
    }

    get derivative() {
        return this.isConstant() ? Numeric.zero() : new Division(new Subtraktion(new Multiplikation(this.op1.derivative(), this.op2), new Multiplikation(this.op1, this.op2.derivative())), new Potenz(this.op2, Numeric.ofF(2)));
    }

    get simplified() {
        simpler = new self(this.op1.simplified(), this.op2.simplified());

        if (simpler.isNumeric())
            return simpler.getValue();

        if (simpler.op1.equals(simpler.op2))
            return Numeric.one();


        return simpler;
    }

    get getValue()
    {
        return this.op1.getValue().divideByN(this.op2.getValue());
    }
}

class Potenz extends BinaryOperation {
    get precedence()
    { return 4; }


    //Nur wegen Ausnahme bei Hochstellung + Keine Klammer
    get ausgeben(outerPrecedence = 0) {
        innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "\\left(" + this.normalAusgeben(this.op1.ausgeben(innerPrec), this.op2.ausgeben()) + "\\right)";
        return this.normalAusgeben(this.op1.ausgeben(innerPrec), this.op2.ausgeben());
    }

    get normalAusgeben(left, right)
    {
        return  left + "^{" + right + "}";
    }

    get normalInlineAusgeben(left, right)
    {
        return  left + "^(" + right + ")";
    }


    get derivative() {
        if (this.isConstant())  return Numeric.zero();
        if (this.op2 + isConstant()) {
            return this.op2 + multiply(this.op1 + toPower(this.op2.subtract(Numeric.one()))) + multiply(this.op1.derivative());
        } else if(this.op1 + equals(Variable.ofName('e'))) {
            return this.op2.derivative() .multiply (this);
        } else if(this.op1 + isConstant()) {
            return this.op2.derivative() + multiply(new ln(this.op1)) .multiply (this);
        } else {
            return this.multiply(
                (new ln(this.op1)).multiply(this.op2.derivative()) + add(
                this.op1.derivative().divideBy(this.op1).multiply(this.op2))
            );
        }
    }

    get simplified() {
        simpler = new self(this.op1.simplified(), this.op2.simplified());

        if(simpler.isNumeric()) {
            return simpler.getValue();
        }

        if (simpler.op2.isZero())
            return Numeric.one();
        if(simpler.op1.isZero())
            return Numeric.zero();
        if (simpler.op1.isOne())
            return Numeric.one();
        if(simpler.op2.isOne())
            return simpler.op1;

        return simpler;
    }

    get getValue() {
        return this.op1.getValue() + toPowerN( this.op2.getValue());
    }
}