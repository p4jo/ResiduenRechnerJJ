// DATEN
var formData;
var HTMLoutput;
var registeredVariables;
var funktion;
function relevantData(element) {
    if (element.type === "text")
        return element.value;
    if (element.type === "checkbox")
        return element.checked;
    return "nul";
}
function loadData() {
    formData = {};
    let interestingInputs = document.getElementsByClassName("II");
    //alert (Object.keys(interestingInputs));
    for (var index in interestingInputs)
        formData[interestingInputs[index].id] = relevantData(interestingInputs[index]); //Hinzufügen
}
function updateData() {
    loadData();
    Variable.workVariable = formData["workVariable"];
    commaIsDecimalPoint = formData["cIDP"];
    Parser.init();
}
//JAVASCRIPT FUNKTIONALITÄT
function sendHTMLIntoDiv(htmlCode, outputDiv) {
    var div = document.getElementById("ausgabe" + outputDiv);
    div.innerHTML = htmlCode;
    mathReload();
}
function sendOutputIntoDiv(outputFunction, outputDiv) {
    //PHP-Style: HTMLoutput entspricht dem einer PHP file.
    HTMLoutput = '';
    outputFunction();
    //alert(HTMLoutput);
    sendHTMLIntoDiv(HTMLoutput, outputDiv);
}
function mathReload() {
    MathJax.typesetPromise();
}
//BUTTON-EVENTS
function funktionSubmit() {
    updateData();
    sendOutputIntoDiv(Ausgabe1, 1);
    showVariables();
    sendHTMLIntoDiv('', 3);
}
function showVariables() {
    sendOutputIntoDiv(VariableList, 2);
}
function reloadSecondArea() {
    updateData();
    sendOutputIntoDiv(Ausgabe2, 1);
    showVariables();
}
