
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

    funktion = funktion.simplified();
    HTMLoutput += "Vereinfacht: " + funktion.display();

    var derivative: EntireFunktion = funktion.derivative();
    HTMLoutput += "Abgeleitet: " + derivative.display();

    derivative = derivative.simplified();
    HTMLoutput += "Ableitung Vereinfacht: " + derivative.display();
}
