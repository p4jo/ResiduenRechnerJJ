//DIES IST DAS HAUPTSKRIPT


/*
//Wird beim laden der Website aktiviert
window.addEventListener("load", function () {
	session_start;
});*/


var commaIsDecimalPoint = true;
var registeredVariables : Object;
var funktion, derivative : EntireFunktion;

function Ausgabe() {
    if (formData.loadData) { //Schon geparste Funktion und Ableitung verwenden, mit geänderten Variablen, die entsprechend eingesetzt werden
        for (var key in registeredVariables) {
            let variable : Variable = registeredVariables[key];
            //Aktualisieren, wenn geändert
            if (formData["input_" + variable.name] != null &&
                formData["input_" + variable.name] != ((variable.inner != null) ? variable.inner.inlineAusgeben() : '')) {
                variable.inner = Parser.parseStringToFunktionElement(formData["input_" + variable.name]);
            }
            variable.useinner = ("check_" + variable.name in formData) && formData["check_" + variable.name];
            if (variable.useInner())
                //Debug
                HTMLoutput += "Eingesetzter Wert \\(" + variable.inner.ausgeben() + "\\) für Variable " + variable.name + "<br>";
        }
    }
    else { //Funktion neu parsen und keine Variablen einsetzen (außer i)
        HTMLoutput += "Keine Variablen außer i werden eingesetzt.<br>";
        Variable.noNumerics = true;
        let theFunktion = Parser.parseStringToFunktionElement(formData["formel"]);
        funktion = new EntireFunktion(theFunktion, "f");
    }


    HTMLoutput += "Eingabe: " + funktion.ausgeben();

    funktion = funktion.simplified();
    HTMLoutput += "Vereinfacht: " + funktion.ausgeben();

    derivative = funktion.derivative();
    HTMLoutput += "Abgeleitet: " + derivative.ausgeben();

    derivative = derivative.simplified();
    HTMLoutput += "Ableitung Vereinfacht: " + derivative.ausgeben();

}
