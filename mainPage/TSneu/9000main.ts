
// DATEN

function relevantData(element: Element) : string | boolean {
	if(element instanceof HTMLInputElement){
		if (element.type === "text")
			return element.value;
		if (element.type === "checkbox")
			return element.checked;
	}
	return null;
}

function loadData() {
	formData = {};
	let interestingInputs = document.getElementsByClassName("II");
	//alert (Object.keys(interestingInputs));
	for (let index in interestingInputs) {
		let element = interestingInputs[index];
		if(!(element instanceof Element))
			break;
		formData[element.id] = relevantData(element); //Hinzufügen
	}
	//dump(formData);
}

function updateInputData() {
	loadData();

    workVariable = formData["workVariable"];
	commaIsDecimalPoint = formData["cIDP"];
	updateLocale();

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
	updateInputData(); 
	
	sendOutputIntoDiv(Ausgabe1, 1);
	showVariableList();
	sendHTMLIntoDiv('', 3);
}

// gets called from VariableList
function reloadSecondArea() {
	updateInputData(); 

	sendOutputIntoDiv(Ausgabe2, 1);
	showVariableList();
}

function showVariableList() {
	sendOutputIntoDiv(VariableListHTM, 2);
}
