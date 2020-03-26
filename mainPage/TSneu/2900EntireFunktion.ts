
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
        return "\\( \\operatorname{" +
            this.name + "}\\left(" + wV.display() + "\\right) =  " + this.inner.display() + "\\)<br>";
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
        let wV = Variable.ofName(wVName);
        
        let oldUseinner = wV.useinner;
        let oldInner = wV.inner;
        
        Variable.workVariable = '';
        wV.useinner = true;
        wV.inner = x;

        let result = new EntireFunktion(this.inner.simplified(), this.name);

        Variable.workVariable = wVName;
        wV.useinner = oldUseinner;
        wV.inner = oldInner;

        return result;
    }
}