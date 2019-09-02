
function checkBrowser(){
		//alert("Diese Website ist noch in Bearbeitung!\nEinige Funktionen können nicht funktionieren.");
	// Opera 8.0+
	var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

	// Firefox 1.0+
	var isFirefox = typeof InstallTrigger !== 'undefined';

	// Safari 3.0+ "[object HTMLElementConstructor]" 
	var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

	// Internet Explorer 6-11
	var isIE = /*@cc_on!@*/false || !!document.documentMode;

	// Edge 20+
	var isEdge = !isIE && !!window.StyleMedia;

	// Chrome 1 - 71
	var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

	// Blink engine detection
	var isBlink = (isChrome || isOpera) && !!window.CSS;

	if(isChrome || isOpera || isEdge) {
		alert("Die Browser Chrome, Opera und Edge unterstützen momentan nich die Formel-Anzeige.")
	}
	
	
	/*var output = 'Detecting browsers by ducktyping:<hr>';
	output += 'isFirefox: ' + isFirefox + '<br>';
	output += 'isChrome: ' + isChrome + '<br>';
	output += 'isSafari: ' + isSafari + '<br>';
	output += 'isOpera: ' + isOpera + '<br>';
	output += 'isIE: ' + isIE + '<br>';
	output += 'isEdge: ' + isEdge + '<br>';
	output += 'isBlink: ' + isBlink + '<br>';
	document.body.innerHTML = output;*/
}

function countMyself() {
    // Check to see if the counter has been initialized
    if ( typeof countMyself.counter == 'undefined' ) {
        // It has not... perform the initialization
        countMyself.counter = 0;
    }

    // Do something stupid to indicate the value
    alert(++countMyself.counter);
}


function klammernErkennen(f) {
	if(klammernCountCheck(f)) {
		//erkennen
	} else {
		alert("Bitte überprüfe deine Klammern.");
	}
	
}

function klammernCountCheck(f) {
	alert((f.match(/,/g) || []).length);
	return true;
}

function klammernErkennen(f) {
	
}


function summe(a, b){
	return a + "+" + b;
}

function produkt(a, b){
	return a + "*" + b;
}

function substraktion(a, b){
	return a + "-" + b;
}

function division(a, b){
	return "<mfrac><mi>" + a + "</mi> <mi>" + b + "</mi></mfrac>";
}