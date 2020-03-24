var formData;
var HTMLoutput;
function relevantData(element) {
    if (element.type === "text")
        //vielleicht reicht = value
        return element.value !== "" ? element.value : null;
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
//JAVASCRIPT FUNKTIONALITÄT
function sendHTMLIntoDiv(htmlCode, outputDiv) {
    var div = document.getElementById("ausgabe" + outputDiv);
    div.innerHTML = htmlCode;
    MathJax.typesetPromise();
}
function sendInputTroughFunctionIntoDiv(outputFunction, outputDiv) {
    loadData();
    //PHP-Style: HTMLoutput entspricht dem einer PHP file.
    HTMLoutput = '';
    outputFunction();
    //alert(HTMLoutput);
    sendHTMLIntoDiv(HTMLoutput, outputDiv);
}
//BUTTON-EVENTS
function funktionSubmit() {
    sendInputTroughFunctionIntoDiv(Ausgabe1, 1);
    showVariables();
    sendHTMLIntoDiv('', 3);
}
function showVariables() {
    sendInputTroughFunctionIntoDiv(VariableList, 2);
}
function reloadSecondArea() {
    sendInputTroughFunctionIntoDiv(Ausgabe2, 3);
    showVariables();
}
function mathReload() {
    MathJax.typesetPromise();
}
