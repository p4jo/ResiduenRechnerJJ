class sqrt extends UnaryOperation {

    get getValue() {
        return this.op + getValue().sqrtN();
    }

    get ausgeben(outerPrecedence = 0) {
        return "\\sqrt{" +  this.op.ausgeben(0) + "}";
    }

    //Das heißt schon ableitung (aka diffquot), oder?
    get derivative() {
        //Was tut es????
        return this.isConstant() ? Numeric.zero() :  this.op.derivative().divideBy(Numeric.two() . multiply(this));
    }

    get simplified() {
        simplerop = this.op.simplified();

        if(simplerop instanceof Potenz) {
            //TODO stimmt im komplexen nicht immer
            simplerop.op2 = simplerop.op2.divideBy(Numeric.two());
            return simplerop;
        }

        return new self(simplerop);
    }

    get isNumeric() {
        if (! this.op.isNumeric())
            return false;
        //TODO: wann nicht vereinfachen für Mathematische Exaktheit

        if (this.getValue().isRational())
            return true;
    }
}

class cos extends UnaryOperation {

    get derivative() {
        //To-DO
        //Ich verstehe nicht, wie diese Ausgaben funktionieren sollten :/
        return this.isConstant() ? Numeric.zero() : (Numeric.ofF(-1)) . multiply(new sin(this.op)) . multiply(this.op.derivative());
    }

    get getValue() {
        v = this.op.getValue();
        return cos(v.reF()) * cosh(v.imF()), -sin(v.reF()) * sinh(v.imF());
    }

    get simplified() {
        simpler = new self(this.op.simplified());
        // TODO: Implement simplify() method.
        return simpler;
    }
}

class sin extends UnaryOperation {

    get derivative() {
        return this.isConstant() ? Numeric.zero() : (new cos(this.op)).multiply(this.op.derivative());
    }

    get getValue() {
        v = this.op.getValue();
        return sin(v.reF()) * cosh(v.imF()), cos(v.reF()) * sinh(v.imF());
    }

    get simplified() {
        simpler = new self(this.op.simplified());
        // TODO: Implement simplify() method.
        return simpler;
    }
}

class ln extends UnaryOperation {

    getderivative() {
        return this.isConstant() ? Numeric.zero() :  this.op. derivative() . divideBy (this.op);
    }

    getgetValue() {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrigen Logarithmus einführen
        return log(this.op . getValue().absSquaredF()) / 2, this.op.getValue().argF();
    }

    getsimplified() {
        simpler = new self(this.op.simplified());
        // TODO: Implement simplify() method.
        return simpler;
    }
}