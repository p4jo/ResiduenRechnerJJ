
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
        return "\\( \\operatorname{" +
            this.name + "}\\left(\\operatorname{\\mathit{" + Variable.workVariable + "}}\\right) =  " + this.inner.display() + "\\)<br>";
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
        
        let useinner = wV.useinner;
        let inner = wV.inner;
        
        Variable.workVariable = '';
        wV.useinner = true;
        wV.inner = x;

        let result = new EntireFunktion(this.inner.simplified(), this.name);

        Variable.workVariable = wVName;
        wV.useinner = useinner;
        wV.inner = inner;

        return result;
    }
}