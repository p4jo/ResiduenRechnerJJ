//DIES IST DAS HAUPTSKRIPT
/*
//Wird beim laden der Website aktiviert
window.addEventListener("load", function () {
    session_start;
});*/
var commaIsDecimalPoint = true;
var registeredVariables;
var funktion;
function Ausgabe1() {
    Variable.activateInner = false;
    Variable.workVariable = formData["workVariable"];
    //Funktion neu parsen und keine Variablen einsetzen (außer i)
    HTMLoutput += "Keine Variablen außer i werden eingesetzt.<br>";
    let theFunktion = Parser.parseStringToFunktionElement(formData["formel"]);
    funktion = new EntireFunktion(theFunktion, "f");
    HTMLoutput += "Eingabe: " + funktion.display();
    funktion = funktion.simplified();
    HTMLoutput += "Vereinfacht: " + funktion.display();
    var derivative = funktion.derivative();
    HTMLoutput += "Abgeleitet: " + derivative.display();
    derivative = derivative.simplified();
    HTMLoutput += "Ableitung Vereinfacht: " + derivative.display();
}
function Ausgabe2() {
    Variable.activateInner = true;
    Variable.workVariable = formData["workVariable"];
    //Schon geparste Funktion und Ableitung verwenden, mit geänderten Variablen, die entsprechend eingesetzt werden
    for (var key in registeredVariables) {
        let variable = registeredVariables[key];
        //Aktualisieren, wenn geändert
        if (formData["input_" + variable.name] != null &&
            formData["input_" + variable.name] != ((variable.inner != null) ? variable.inner.displayInline() : '')) {
            variable.inner = Parser.parseStringToFunktionElement(formData["input_" + variable.name]);
        }
        variable.useinner = ("check_" + variable.name in formData) && formData["check_" + variable.name];
        // alert(`${variable.name} : useinner: ${variable.useinner}, useInner(): ${variable.useInner()}`);
        if (variable.useInner())
            //Debug
            HTMLoutput += "Eingesetzter Wert \\(" + variable.inner.display() + "\\) für Variable " + variable.name + "<br>";
    }
    HTMLoutput += "Eingabe: " + funktion.display();
    funktion = funktion.simplified();
    HTMLoutput += "Vereinfacht: " + funktion.display();
    var derivative = funktion.derivative();
    HTMLoutput += "Abgeleitet: " + derivative.display();
    derivative = derivative.simplified();
    HTMLoutput += "Ableitung Vereinfacht: " + derivative.display();
}
