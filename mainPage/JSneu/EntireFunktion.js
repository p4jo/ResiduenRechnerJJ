class EntireFunktion {
    //Hier ist das Wurzelelement gemeint, nicht die mathematische Wurzel
    //Dies ist nur der Übersicht halber
    //private var $root;
    //public string $name;

    constructor(root, name = 'f') {
        this.root = root;
        this.name = name;
    }


    get ausgeben() {
        //To-Do
        //Ausgabe fixen
        return "\\( " + this.name + "\\left(\\mathit{" + Variable.workVariable + "}\\right) =  " + this.root.ausgeben() + "\\)<br>";
    }

    get simplified() {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        return new self(this.root.simplified(), this.name);
    }

    get derivative() {
        return new self(this.root.derivative(), this.name + "'");
    }
}