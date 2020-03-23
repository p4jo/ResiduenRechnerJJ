//DIES IST DAS HAUPTSKRIPT


/*
//Wird beim laden der Website aktiviert
window.addEventListener("load", function () {
	session_start;
});*/


var commaIsDecimalPoint = true;
var registeredVariables : Object;

function Ausgabe() {
    var result = '';
    if (loadData) {
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
                result += "Eingesetzter Wert \\(" + variable.inner.ausgeben() + "\\) für Variable " + variable.name + "<br>";
        }

        /*
        funktion = _SESSION['funktion'];
        funktionSimplified = _SESSION['funktionSimplified'];
        derivative = _SESSION['derivative'];
        derivativeSimplified = _SESSION['derivativeSimplified'];
        */
    }
    else {
        result += "Keine Variablen außer i werden eingesetzt.<br>";
        Variable.noNumerics = true;
        root = Parser.parseStringToFunktionElement(formData["formel"]);
        funktion = new EntireFunktion(root, "f");
    }


    result += "Eingabe: " . funktion.ausgeben();

    funktion = funktion.simplified();
    result += "Vereinfacht: " . funktion.ausgeben();

    derivative = funktion.derivative();
    result += "Abgeleitet: " . derivative.ausgeben();

    derivative = derivative.simplified();
    result += "Ableitung Vereinfacht: " . derivative.ausgeben();

}
