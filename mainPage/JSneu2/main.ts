// DATEN
declare const MathJax;
var formData : Object;
var HTMLoutput : string;

function relevantData(element) : string | boolean {
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

function sendInputTroughFunctionIntoDiv(outputFunction : Function, outputDiv, loadData : boolean) {

	formData = {"loadData": loadData};
	for (var element of document.getElementsByClassName("II"))
		formData[element.id] = relevantData(element);
	
	sendHTMLIntoDiv(outputFunction(), outputDiv);
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
