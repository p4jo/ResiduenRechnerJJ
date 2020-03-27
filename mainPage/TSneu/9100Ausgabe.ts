
function parseFunktion() {
    let theFunktion = Parser.parseStringToFunktionElement(formData["formel"]);
    funktion = new EntireFunktion(theFunktion, "f");
}


/** Funktion neu parsen und keine Variablen einsetzen (außer i)
 * */
function Ausgabe1() {

    Variable.activateInner = false;

    HTMLoutput += "Keine Variablen außer i werden eingesetzt.<br>";
    parseFunktion();

    Ausgabe();

}

/**
 * Schon geparste Funktion und Ableitung verwenden, mit geänderten Variablen, die entsprechend eingesetzt werden
 */
function Ausgabe2() {

    Variable.activateInner = true;
    
    updateVariables();

    Ausgabe();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//TODO: Noch zum Residuen berechnen umschreiben. Zwischenschritte angeben (wie Integralrechner). 
//Evtl. HTML-Bereiche verwenden und mit CSS farbig / mit Rand etc. machen
function Ausgabe() {
    HTMLoutput += "Eingabe: " + funktion.display();
    let residuePoint = Parser.parseStringToFunktionElement(formData["residuePoint"]);
    let Df : EntireFunktion[] = new Array(10);
    Df[0] = funktion.simplified();
    HTMLoutput += "Vereinfacht: " + Df[0].display();

    for (let i : number = 1; i < 10; i++) {
        Df[i] = Df[i-1].derivative().simplified();
    }
    for (let i : number = 0; i < 10; i++) {
        HTMLoutput += i+"-te Ableitung: " + Df[i].display() + " mit Wert " + Df[i].valueAt(residuePoint).display();
    }


}
