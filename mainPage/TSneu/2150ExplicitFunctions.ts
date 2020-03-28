
class sqrt extends UnaryOperation {

    getValue() : Numeric
    {
        return this.op.getValue().sqrtN();
    }

    display(outerPrecendence : number = 0) : string {
        return "\\sqrt{" +  this.op.display() + "}";
    }

    derivative() : FunktionElement {
        return this.isConstant() ? Numeric.zero :  this . op . derivative() . divideBy(Numeric.two.multiply(this));
    }

    simplified() : FunktionElement {
        //Wollen wir wirklich sqrt(30) als rational ausgeben?
        if (this.isNumeric())
            return this.getValue();

        let simplerop = this.op.simplified();

        if(simplerop instanceof Potenz) {
            //TODO stimmt im komplexen nicht immer
            simplerop.op2 = simplerop.op2.divideBy(Numeric.two);
            return simplerop;
        }

        return new sqrt(simplerop);
    }

    isNumeric(): boolean
    {
        if (! this.op.isNumeric())
            return false;
        //TODO: wenn nicht vereinfachen für Mathematische Exaktheit

        //result += this.inlineAusgeben() + "=".this.getValue().inlineAusgeben();
        if (this.getValue().isRational() || ! this.op.getValue().isRational())
            return true;
        return false;

    }
}

class cos extends UnaryOperation {

    derivative(): FunktionElement
    {
        return this.isConstant() ? Numeric.zero : (Numeric.ofF(-1)) . multiply(new sin(this.op)) . multiply(this.op.derivative());
    }

    getValue() : Numeric
    {
        let v = this.op.getValue();
        return Numeric.ofF(Math.cos(v.reF()) * Math.cosh(v.imF()), -Math.sin(v.reF()) * Math.sinh(v.imF()));
    }

    simplified(): FunktionElement
    {
        let simpler = new cos(this.op.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        // TODO: Implement simplify() method.
        return simpler;
    }
}

class sin extends UnaryOperation {

    derivative(): FunktionElement
    {
        return this.isConstant() ? Numeric.zero : (new cos(this.op)) . multiply(this.op.derivative());
    }

    getValue() : Numeric
    {
        let v = this.op.getValue();
        return Numeric.ofF(Math.sin(v.reF()) * Math.cosh(v.imF()), Math.cos(v.reF()) * Math.sinh(v.imF()));
    }

    simplified(): FunktionElement
    {
        let simpler = new sin(this.op.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        // TODO: Implement simplify() method.

        return simpler;
    }
}

class ln extends UnaryOperation {

    derivative(): FunktionElement
    {
        return this.isConstant() ? Numeric.zero :  this.op. derivative() . divideBy (this.op);
    }

    getValue() : Numeric
    {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrigen Logarithmus einführen
        return Numeric.ofF(Math.log(this.op . getValue().absSquaredF()) / 2, this.op.getValue().argF());
    }

    simplified(): FunktionElement
    {
        let simpler = new ln(this.op.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();

        // TODO: Implement simplify() method.
        return simpler;
    }
}
