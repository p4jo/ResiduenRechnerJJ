
// TODO: Auch Operationen müssen, wie Variablen, nur zu Numerics vereinfacht werden dürfen, wenn das gewünscht ist
// (z.B. Additionen immer erlaubt (oder bei rational plus number nicht), aber Wurzel und ln nicht erlaubt, weil das in Zahlen in mathematischer Notation auch stehen bleibt


/**
 * Class FunktionElement: IMMUTABLE
 */
abstract class FunktionElement {
    abstract display(outerPrecedence?: number): string;
    abstract displayInline(outerPrecedence?: number): string;

    abstract derivative(): FunktionElement;

    abstract simplified(): FunktionElement;

    /**
     * bezüglich der konstanten Variablen konstant
     */
    abstract isNumeric(): boolean;

    /**
     * bezüglich der Arbeitsvariablen konstant
     */
    abstract isConstant(): boolean;

    isOne(): boolean {
        return false;
    }
    isZero(): boolean {
        return false;
    }

    /**
     * Gibt die erste vorkommende Potenz der übergebenen Variablen zurück
     * @returns Exponent der Variablen
     * @default default return value is Numeric.zero()
     */
    abstract isMultipleOf(variable: Variable): FunktionElement;

    /**
     * Entfernt das erste Vorkommen der übergebenen Variablen
     */
    //abstract removeVariable(variable: Variable): FunktionElement;
    removeVariable(variable: Variable): FunktionElement {return this;}


    // WARNING: ONLY CALL ON (RELATIVELY) NUMERIC OBJECTS
    abstract getValue(): Numeric;


    equals(other: FunktionElement): boolean {
        if (this.isNumeric() != other.isNumeric() || this.isConstant() != other.isConstant())
            return false;
        if (this.isNumeric() && other.isNumeric())
            return other.getValue().equalsN(this.getValue());
        //TODO
        return null;
    }

    //ENDE ABSTRAKTE FUNKTIONEN

    add(other: FunktionElement): Addition {
        return new Addition(this, other);
    }
    subtract(other: FunktionElement): Subtraction {
        return new Subtraction(this, other);
    }
    multiply(other: FunktionElement): Multiplication {
        return new Multiplication(this, other);
    }
    divideBy(other: FunktionElement): Division {
        return new Division(this, other);
    }
    toPower(other: FunktionElement): Potenz {
        return new Potenz(this, other);
    }
    sqrt(): sqrt {
        return new sqrt(this);
    }
}


/**
 * Alle Funktionen sollten als Unterklassen von den Operation - Klassen definiert werden,
 * sie können simplify und müssen ableiten überschreiben, statische Funktionen sollten nicht
 * und ausgeben muss nicht überschrieben werden.
 * Jeder Operator und jede Funktion muss in operations eingetragen werden.
 */
abstract class Operation extends FunktionElement {

    protected op: FunktionElement[];

    constructor(...op: FunktionElement[]) {
        super();
        this.op = op;
    }

    isNumeric(): boolean {
        let result = true;
        for (let index in this.op) {
            result = result && this.op[index].isNumeric();
        }
        return result;
    }

    isConstant(): boolean {
        let result = true;
        for (let index in this.op) {
            result = result && this.op[index].isConstant();
        }
        return result;
    }

    display(outerPrecendence: number = 0): string {
        return "\\operatorname{" + this.constructor.name + "}\\left(" +
            this.op.map(a => a.display()).join(', ') + "\\right)";
    }

}

abstract class UnaryOperation extends FunktionElement {

    protected op: FunktionElement;

    constructor(op: FunktionElement) {
        super();
        this.op = op;
    }

    isNumeric(): boolean {
        return this.op.isNumeric();
    }

    isConstant(): boolean {
        return this.op.isConstant();
    }

    display(outerPrecedence: number = 0): string //Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        //ausgeben gibt mit Klammern aus
        return "\\operatorname{" + this.constructor.name + "}\\left(" + this.op.display() + '\\right)';
    }

    displayInline(outerPrecedence: number = 0): string //Ausgabe standardmäßig in Präfixnotation (Funktionsschreibweise)
    {
        return this.constructor.name + '(' + this.op.displayInline() + ")";
    }

}

abstract class BinaryOperation extends FunktionElement {

    op1: FunktionElement;
    op2: FunktionElement;

    constructor(op1: FunktionElement, op2: FunktionElement) {
        super();
        this.op1 = op1;
        this.op2 = op2;
    }

    isNumeric(): boolean {
        return this.op1.isNumeric() && this.op2.isNumeric();
    }

    isConstant(): boolean {
        return this.op1.isConstant() && this.op2.isConstant();
    }

    display(outerPrecedence: number = 0): string {
        var innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "\\left(" + this.displayNormally(this.op1.display(innerPrec), this.op2.display(innerPrec)) + "\\right)";
        return this.displayNormally(this.op1.display(innerPrec), this.op2.display(innerPrec));
    }

    displayNormally(left, right) {
        return this.displayInlineNormally(left, right);
    }

    displayInline(outerPrecedence: number = 0): string {
        var innerPrec = this.precedence();
        if (outerPrecedence > innerPrec)
            return "(" + this.displayInlineNormally(this.op1.displayInline(innerPrec), this.op2.displayInline(innerPrec)) + ")";
        return this.displayInlineNormally(this.op1.displayInline(innerPrec), this.op2.displayInline(innerPrec));
    }

    abstract displayInlineNormally(left, right): string;

    abstract precedence(): number;
}





class Variable extends FunktionElement {
    static activateInner: boolean = true;

    name: string;
    inner: FunktionElement;
    useinner: boolean = false;

    private constructor(name: string, inner: FunktionElement = null, useInner: boolean = false) {
        super();
        this.name = name;
        this.inner = inner != null ? inner.simplified() : null;
        this.useinner = useInner;
    }

    derivative(): FunktionElement {
        if (workVariable == this.name)
            return Numeric.one;
        else if (this.useInner())
            return this.inner.derivative();
        return Numeric.zero;
    }

    display(outerPrecendence: number = 0): string {
        // \operatorname für mehrbuchstabige Bezeichner (schadet nicht)
        //mathit Versionen der kyrillischen Buchstaben sind zu breit gespaced. Bei griechischen Buchstaben sieht die (ohne)-Version ungut aus.
        //mathtt und mathbf sind gut, mathtt sieht allerdings fehl am Platz aus
        if (this.useInner())
            return "\\operatorname{\\mathbf{" + this.name + '}}';
        if (!this.isConstant())
            return "\\operatorname{\\mathtt{" + this.name + "}}";
        return "\\operatorname{\\mathit{" + this.name + '}}';
        /* return this.isConstant()
                ?(this.isNumeric()
                    ? this.inner.getValue().display()
                    : (this.useInner()
                        ? "\\mathbf{" + this.name + '}'
                        : this.name ))
                :"\\mathit{" + this.name + "}" ; */
    }

    displayInline(outerPrecedence: number = 0): string {
        return this.name;
    }

    simplified(): FunktionElement {
        if (this.useInner())
            return this.inner.simplified();
        else
            return this;
    }

    isNumeric(): boolean {
        return this.useInner() && this.isConstant() && this.inner.isNumeric();
    }

    useInner(): boolean {
        if (this.inner === null)
            return false;

        if (Variable.activateInner || this.name == workVariable)
            return this.useinner;

        return this.name == 'i';
    }

    isConstant(): boolean {
        return this.name != workVariable && (!this.useInner() || this.inner.isConstant());
    }

    // wirft entweder Fehler, oder rechnet mit nichtssagenden, konstanten Werten, wenn
    // getValue aufgerufen wird, obwohl diese Variable nicht numeric ist.
    getValue(): Numeric {
        if (!this.isNumeric())
            HTMLoutput += "Programmierfehler : getValue on nonnumeric Variable <br>";
        return this.inner.getValue();
    }

    isOne(): boolean {
        return this.isNumeric() && this.getValue().isOne();
    }

    isZero(): boolean {
        return this.isNumeric() && this.getValue().isZero();
    }

    /// Element-wise
    /// Static

    static init() {
        //User kann hier eigene "Null-äre Operationen" enumberragen, d.h. Kurzschreibweisen wie sin(3x^2), oder pi+e (vereinfachbar)
        registeredVariables = {
            'τ': new Variable('τ', new Numeric(new FloatReal(2 * Math.PI))),
            'e': new Variable('e', new Numeric(new FloatReal(Math.E))),
            'i': new Variable('i', new Numeric(Real.zero, Real.one), true),
            'φ': new Variable('φ', Numeric.one.add(new sqrt(new Numeric(new RationalReal(5)))).divideBy(Numeric.two))
        };
        registeredVariables['π'] = new Variable('π', registeredVariables['τ'].divideBy(Numeric.two), true);
        //TODO tri-Symbol zu Schrift hinzufügen
        registeredVariables['ш'] = new Variable('ш', registeredVariables['τ'].divideBy(new Numeric(new RationalReal(4), Real.zero)), true);
        registeredVariables['°'] = new Variable('°', registeredVariables['τ'].divideBy(new Numeric(new RationalReal(360), Real.zero)), true);
    }

    static ofName(name: string): Variable {
        if (!(name in registeredVariables))
            registeredVariables[name] = new Variable(name);
        return registeredVariables[name];
    }


    isMultipleOf(variable: Variable): FunktionElement {
        return variable == this ? Numeric.one : Numeric.zero;
    }

    removeVariable(variable: Variable): FunktionElement {
        return variable == this ? Numeric.zero : this;
    }

}
