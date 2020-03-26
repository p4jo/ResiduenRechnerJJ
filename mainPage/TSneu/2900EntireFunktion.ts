
class EntireFunktion
{
    readonly inner : FunktionElement;
    name: string;

    constructor(inner : FunktionElement, name : string = 'f')
    {
        this.inner = inner;
        this.name = name;
    }


    display() : string
    {
        let wV = Variable.ofName(Variable.workVariable);
        return "\\( " +
            this.name + "\\left(" + wV.display() + "\\right) =  " + this.inner.display() + "\\)<br>";
    }

    simplified() : EntireFunktion
    {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        return new EntireFunktion(this.inner.simplified(), this.name);
    }

    derivative() : EntireFunktion
    {
        return new EntireFunktion(this.inner.derivative(), this.name + "'");
    }


    valueAt(x : FunktionElement) : EntireFunktion
    {
        let wVName = Variable.workVariable;
        Variable.workVariable = '';
        let wV = Variable.ofName(wVName);
        wV.useinner = true;
        wV.inner = x;

        let result = new EntireFunktion(this.inner.simplified(), this.name);

        return result;
    }
}