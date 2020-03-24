function inObject(needle, haystack, argStrict = true) {
    var key = '';
    var strict = !!argStrict;
    // we prevent the double check (strict && arr[key] === ndl) || (!strict && arr[key] === ndl)
    // in just one for, in order to improve the performance
    // deciding wich type of comparation will do before walk array
    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) {
                return true;
            }
        }
    }
    else {
        for (key in haystack) {
            if (haystack[key] == needle) { // eslint-disable-line eqeqeq
                return true;
            }
        }
    }
    return false;
}
function dump(obj) {
    var out = '';
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }
    alert(out);
}
//var global = Function('return this;')() || eval('this');
function number_format(n = 0, decimals = 0, decPoint = '.', thousandsSep = '') {
    //n = +(n.toString().replace(/[^0-9+\-Ee.]/g, ''));
    decimals = Math.round(Math.abs(decimals));
    var toFixedFix = function (n, prec) {
        if (n.toString().indexOf('e') === -1) {
            return +(Math.round(+(n + 'e+' + prec)) + 'e-' + prec);
        }
        else {
            var arr = ('' + n).split('e');
            var sig = '';
            if (+arr[1] + prec > 0) {
                sig = '+';
            }
            return (+(Math.round(+(+arr[0] + 'e' + sig + (+arr[1] + prec))) + 'e-' + prec)).toFixed(prec);
        }
    };
    // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
    let s = (decimals > 0 ? toFixedFix(n, decimals) : Math.round(n)).toString().split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, thousandsSep);
    }
    if ((s[1] || '').length < decimals) {
        s[1] = s[1] || '';
        s[1] += new Array(decimals - s[1].length + 1).join('0');
    }
    return s.join(decPoint);
}
