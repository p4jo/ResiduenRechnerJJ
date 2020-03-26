function inObject (needle, haystack, argStrict = true) { 
	var key = ''
	var strict = !!argStrict
  
	// we prevent the double check (strict && arr[key] === ndl) || (!strict && arr[key] === ndl)
	// in just one for, in order to improve the performance
	// deciding wich type of comparation will do before walk array
	if (strict) {
	  for (key in haystack) {
		if (haystack[key] === needle) {
		  return true
		}
	  }
	} else {
	  for (key in haystack) {
		if (haystack[key] == needle) { // eslint-disable-line eqeqeq
		  return true
		}
	  }
	}
  
	return false
  }

  
function dump(obj) {
	var out = '';
	for (var i in obj) {
		out += i + ": " + obj[i] + "\n";
	}

	alert(out);
}

function number_format (n : number, decimals : number|null = null, decPoint : string = '.', thousandsSep : string = '') { 

	if (!decPoint)  decPoint = '.'; 
	if (!thousandsSep) thousandsSep = '';
 
    if (n == null || !isFinite(n)) {
        throw new TypeError("n is not valid");
    }

	//Höchstens so viele Nachkommastellen verwenden, wie in toString ausgegeben werden (evtl. 0)
	let maxDec = (n.toString()+'.').split('.')[1].length;
	decimals = decimals == null ? maxDec : Math.min(decimals, maxDec);


    var splitNum = n.toFixed(decimals).split('.');
    splitNum[0] = splitNum[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
   	return splitNum.join(decPoint);

}