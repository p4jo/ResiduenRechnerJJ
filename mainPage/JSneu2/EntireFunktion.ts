
class EntireFunktion
{
    //Hier ist das Wurzelelement gemenumber, nicht die mathematische Wurzel
    private root : FunktionElement;
    name: string;

    constructor(root : FunktionElement, name : string = 'f')
    {
        this.root = root;
        this.name = name;
    }


    ausgeben()
    {
        /*mathvariant=\"bold\"*/
        return "\\( " +
            this.name + "\\left(\\mathit{" + Variable.workVariable + "}\\right) =  " + this.root.ausgeben(0) + "\\)<br>";
    }

    simplified()
    {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        return new EntireFunktion(this.root.simplified(), this.name);
    }

    derivative()
    {
        return new EntireFunktion(this.root.derivative(), this.name + "'");
    }
}