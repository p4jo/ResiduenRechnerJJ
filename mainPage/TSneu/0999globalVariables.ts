declare var MathJax;

var formData : Object;
var HTMLoutput : string;
var registeredVariables : Object;
var workVariable :  string;
var funktion : EntireFunktion;
var commaIsDecimalPoint = false;


const floatToRationalTolerance: number = Number.EPSILON;
const floatToRationalMaxDen: number = 100000;    
const displayDigits : number = 8;


var registeredVariables: Object;

// Enter any new Operator here. By default Operators are left-grouping within their precedence class, add key
// 'rightAssociative' if meant otherwise
const operations = {
    '+': { 'name': 'Addition', 'arity': 2, 'precedence': 2 },
    '-': { 'name': 'Subtraction', 'arity': 2, 'precedence': 2 },
    '/': { 'name': 'Division', 'arity': 2, 'precedence': 4 },
    '÷': { 'name': 'Division', 'arity': 2, 'precedence': 3 },
    ':': { 'name': 'Division', 'arity': 2, 'precedence': 3 },
    '*': { 'name': 'Multiplication', 'arity': 2, 'precedence': 3 },
    '×': { 'name': 'Multiplication', 'arity': 2, 'precedence': 3 },
    '·': { 'name': 'Multiplication', 'arity': 2, 'precedence': 3 },
    //    '%' : {'name' : 'RestMod', 'arity' : 2, 'precedence' : 3},
    '^': { 'name': 'Potenz', 'arity': 2, 'precedence': 4, 'rightAssociative': 1 },

    'sin': { 'name': 'sin', 'arity': 1, 'precedence': 5 },
    'cos': { 'name': 'cos', 'arity': 1, 'precedence': 5 },
    'ln': { 'name': 'ln', 'arity': 1, 'precedence': 5 },
    'sqrt': { 'name': 'sqrt', 'arity': 1, 'precedence': 5 },
    'Wurzel': { 'name': 'sqrt', 'arity': 1, 'precedence': 5 },
    'ζ': { 'name': 'RiemannZeta', 'arity': 1, 'precedence': 5 },
    //Pi-Funktion (entschobene Gamma-Funktion) //postfix
    '!': { 'name': 'Factorial', 'arity': 1, 'precedence': 5 },
};