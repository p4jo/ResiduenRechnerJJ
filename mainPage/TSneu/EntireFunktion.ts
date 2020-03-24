
class EntireFunktion
{
    readonly inner : FunktionElement;
    name: string;

    constructor(inner : FunktionElement, name : string = 'f')
    {
        this.inner = inner;
        this.name = name;
    }


    display()
    {
        /*mathvariant=\"bold\"*/
        return "\\( " +
            this.name + "\\left(\\mathit{" + Variable.workVariable + "}\\right) =  " + this.inner.display() + "\\)<br>";
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