class sqrt extends UnaryOperation {
    getValue() {
        return this.op.getValue().sqrtN();
    }
    display(outerPrecendence = 0) {
        return "\\sqrt{" + this.op.display() + "}";
    }
    derivative() {
        return this.isConstant() ? Numeric.zero : this.op.derivative().divideBy(Numeric.two.multiply(this));
    }
    simplified() {
        if (this.isNumeric())
            return this.getValue();
        let simplerop = this.op.simplified();
        if (simplerop instanceof Potenz) {
            //TODO stimmt im komplexen nicht immer
            simplerop.op2 = simplerop.op2.divideBy(Numeric.two);
            return simplerop;
        }
        return new sqrt(simplerop);
    }
    isNumeric() {
        if (!this.op.isNumeric())
            return false;
        //TODO: wann nicht vereinfachen für Mathematische Exaktheit
        //result += this.inlineAusgeben() + "=".this.getValue().inlineAusgeben();
        if (this.getValue().isRational() || !this.op.getValue().isRational())
            return true;
        return false;
    }
}
class cos extends UnaryOperation {
    derivative() {
        return this.isConstant() ? Numeric.zero : (Numeric.ofF(-1)).multiply(new sin(this.op)).multiply(this.op.derivative());
    }
    getValue() {
        let v = this.op.getValue();
        return Numeric.ofF(Math.cos(v.reF()) * Math.cosh(v.imF()), -Math.sin(v.reF()) * Math.sinh(v.imF()));
    }
    simplified() {
        let simpler = new cos(this.op.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        // TODO: Implement simplify() method.
        return simpler;
    }
}
class sin extends UnaryOperation {
    derivative() {
        return this.isConstant() ? Numeric.zero : (new cos(this.op)).multiply(this.op.derivative());
    }
    getValue() {
        let v = this.op.getValue();
        return Numeric.ofF(Math.sin(v.reF()) * Math.cosh(v.imF()), Math.cos(v.reF()) * Math.sinh(v.imF()));
    }
    simplified() {
        let simpler = new sin(this.op.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        // TODO: Implement simplify() method.
        return simpler;
    }
}
class ln extends UnaryOperation {
    derivative() {
        return this.isConstant() ? Numeric.zero : this.op.derivative().divideBy(this.op);
    }
    getValue() {
        //Todo Verzweigungsschnitt beachten, vielleicht 2-parametrigen Logarithmus einführen
        return Numeric.ofF(Math.log(this.op.getValue().absSquaredF()) / 2, this.op.getValue().argF());
    }
    simplified() {
        let simpler = new ln(this.op.simplified());
        if (simpler.isNumeric())
            return simpler.getValue();
        // TODO: Implement simplify() method.
        return simpler;
    }
}
