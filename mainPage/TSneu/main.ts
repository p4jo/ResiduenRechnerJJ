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

function loadData() {
	formData = {};
	let interestingInputs = document.getElementsByClassName("II");
	//alert (Object.keys(interestingInputs));
	for (var index in interestingInputs)
		formData[interestingInputs[index].id] = relevantData(interestingInputs[index]); //Hinzufügen
}

function prepare() {
	loadData();

    Variable.workVariable = formData["workVariable"];
    commaIsDecimalPoint = formData["cIDP"];
}

//JAVASCRIPT FUNKTIONALITÄT

function sendHTMLIntoDiv(htmlCode : string, outputDiv) {
	var div = document.getElementById("ausgabe" + outputDiv);
	div.innerHTML = htmlCode;
	mathReload();
}

function sendOutputIntoDiv(outputFunction : Function, outputDiv) {

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
	prepare(); 
	
	sendOutputIntoDiv(Ausgabe1, 1);
	showVariables();
	sendHTMLIntoDiv('', 3);
}

function showVariables() {
	sendOutputIntoDiv(VariableList, 2);
}

function reloadSecondArea() {
	prepare(); 

	sendOutputIntoDiv(Ausgabe2, 3);
	showVariables();
}
