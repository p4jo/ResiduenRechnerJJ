
class EntireFunktion
{
    readonly inner : FunktionElement;
    name: string;

    constructor(inner : FunktionElement, name : string = 'f')
    {
        this.inner = inner;
        this.name = name;
    }


    ausgeben()
    {
        /*mathvariant=\"bold\"*/
        dump (this);
        return "\\( " +
            this.name + "\\left(\\mathit{" + Variable.workVariable + "}\\right) =  " + this.inner.ausgeben() + "\\)<br>";
    }

    simplified()
    {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        return new EntireFunktion(this.inner.simplified(), this.name);
    }

    derivative()
    {
        return new EntireFunktion(this.inner.derivative(), this.name + "'");
    }
}