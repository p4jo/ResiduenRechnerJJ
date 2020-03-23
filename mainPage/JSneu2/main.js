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
//JAVASCRIPT FUNKTIONALITÄT
function sendHTMLIntoDiv(htmlCode, outputDiv) {
    var div = document.getElementById("ausgabe" + outputDiv);
    div.innerHTML = htmlCode;
    MathJax.typesetPromise();
    // alert("still working");
}
function sendInputTroughFunctionIntoDiv(outputFunction, outputDiv, loadData) {
    formData = { "loadData": loadData };
    var interestingInputs = document.getElementsByClassName("II");
    alert(Object.keys(interestingInputs));
    for (var element in interestingInputs)
        formData[interestingInputs[element].id] = relevantData(element);
    HTMLoutput = '';
    outputFunction();
    sendHTMLIntoDiv(HTMLoutput, outputDiv);
}
//BUTTON-EVENTS
function funktionSubmit() {
    sendInputTroughFunctionIntoDiv(Ausgabe, 1, false);
    showVariables();
    sendHTMLIntoDiv('', 3);
}
function showVariables() {
    sendInputTroughFunctionIntoDiv(VariableList, 2, true);
}
function reloadSecondArea() {
    sendInputTroughFunctionIntoDiv(Ausgabe, 3, true);
    showVariables();
}
function mathReload() {
    MathJax.typesetPromise();
}
function dump(obj) {
    var out = '';
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }
    alert(out);
}
