

class Parser
{
    // REGEXes
    //TODO: Vervollständigen der zulässigen Buchstaben (mit Schriftart abgleichen)
    private static letterChar =
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'ä', 'ö', 'ü', 'ß', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
    'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
    'W', 'X', 'Y', 'Z', 'Ä', 'Ö', 'Ü', 'ς', 'ε', 'ρ', 'τ', 'υ', 'θ',
    'ι', 'ο', 'π', 'λ', 'κ', 'ξ', 'η', 'γ', 'φ', 'δ', 'σ', 'α', 'ζ',
    'χ', 'ψ', 'ω', 'β', 'ν', 'μ', 'Ε', 'Ρ', 'Τ', 'Υ', 'Θ', 'Ι', 'Ο',
    'Π', 'Λ', 'Κ', 'Ξ', 'Η', 'Γ', 'Φ', 'Δ', 'Σ', 'Α', 'Ζ', 'Χ', 'Ψ',
    'Ω', 'Β', 'Ν', 'Μ', 'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш',
    'щ', 'з', 'х', 'э', 'ж', 'д', 'л', 'о', 'р', 'п', 'а', 'в',
    'ы', 'ф', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'Й',
    'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Э', 'Ж',
    'Д', 'Л', 'О', 'Р', 'П', 'А', 'В', 'Ы', 'Ф', 'Я', 'Ч', 'С',
    'М', 'И', 'Т', 'Ь', 'Б', 'Ю', '\'', '°'];
    //TODO: Vervollständigen
    private static namedChars = {'alpha' : 'α', 'alfa' : 'α',
    'beta' : 'β', 'vita' : 'β', 'gamma' : 'γ', 'delta' : 'δ', 'epsilon' : 'ε',
    'zeta' : 'ζ', 'zita' : 'ζ', 'eta' : 'η', 'ita' : 'η', 'theta' : 'θ', 'thita' : 'θ',
    'iota' : 'ι', 'kappa' : 'κ', 'lambda' : 'λ', 'lamda' : 'λ', 
    'my' : 'μ', 'mi' : 'μ', 'ny' : 'ν', 'ni' : 'ν', 'xi' : 'ξ', 
    'omikron' : 'ο', 'pi' : 'π', 'rho' : 'ρ', 'ro' : 'ρ', 'sigma' : 'σ', 
    'tau' : 'τ', 'taf' : 'τ', 'ypsilon' : 'υ', 'phi' : 'φ', 'fi' : 'φ',
    'chi' : 'χ', 'psi' : 'ψ', 'omega': 'ω',
                                'Alpha' : 'Α', 'Alfa' : 'Α',
    'Beta' : 'Β', 'Vita' : 'Β', 'Gamma' : 'Γ', 'Delta' : 'Δ', 'Epsilon' : 'Ε',
    'Zeta' : 'Ζ', 'Zita' : 'Ζ', 'Eta' : 'Η', 'Ita' : 'Η', 'Theta' : 'Θ', 'Thita' : 'Θ',
    'Iota' : 'Ι', 'Kappa' : 'Κ', 'Lambda' : 'Λ', 'Lamda' : 'Λ', 
    'My' : 'Μ', 'Mi' : 'Μ', 'Ny' : 'Ν', 'Ni' : 'Ν', 'Xi' : 'Ξ', 
    'Omikron' : 'Ο', 'Pi' : 'Π', 'Rho' : 'Ρ', 'Ro' : 'Ρ', 'Sigma' : 'Σ', 
    'Tau' : 'Τ', 'Taf' : 'Τ', 'Ypsilon' : 'Υ', 'Phi' : 'Φ', 'Fi' : 'Φ',
    'Chi' : 'Χ', 'Psi' : 'Ψ', 'Omega': 'Ω',
    'tri' : 'ш'};
    private static leftBraceChars : string[] = ['(','[','{','<','«'];
    private static rightBraceChars : string[] = [')',']','}','>','»'];
    
    private static separatorChars : string[];
    private static numChars;
    private static singleCharacterTokens : string[];
    private static forbiddenToMultiplyWithMeChars : string[];
    private static forbiddenToMultiplyMeTokens : string[];


    static init()
    {
        Parser.numChars = ['1','2','3','4','5','6','7','8','9','0','.', '\''];
        Parser.separatorChars = [';'];
        if (commaIsDecimalPoint)
            Parser.numChars.push(',');
        else {
            Parser.separatorChars.push(',');
        }

        let specialChars = [
            "#",
            "%",
            "&",
            "*",
            "+",
            "-",
            "/",
            ":",
            ";",
            "?",
            "@",
            "^",
            "_",
            "|",
            "~",
            "‖",
            "×",
            "·",
            "¶",
            "±",
            "¤",
            "÷",
            "‼",
            "⌂"
        ].concat( Parser.separatorChars );
        Parser.singleCharacterTokens = specialChars.concat(Parser.leftBraceChars,Parser.rightBraceChars);
        Parser.forbiddenToMultiplyWithMeChars = specialChars.concat(Parser.rightBraceChars);
        Parser.forbiddenToMultiplyMeTokens = specialChars.concat(Parser.leftBraceChars, Object.keys(operations));
    }


    static parseStringToFunktionElement(inputStr : string) {
        if (inputStr == null || inputStr == '')
            return Numeric.zero;
        
        let tokens = Parser.tokenize(inputStr);
        //HTMLoutput += "Tokens: " + tokens.join(' ') + "<br>";
        let RPN = Parser.parseTokensToRPN(tokens);
        //HTMLoutput += "RPN: " + RPN.join(' ') + "<br>";
        return Parser.parseRPNToFunktionElement(RPN);
    }

    private static tokenize(input : string) : any[]
    {
        //var_dump(input);
        let tokens = [];
        for (let i = 0; i < input.length; i++) {
            let chr = input[i];

            if (chr.trim() === '') {
                continue;
            }

            //WENN der letzte Token kein Operator war, oder eine Klammer zu (also ein Operand)
            //UND der nächste auch kein Operator wird, oder eine Klammer auf (also noch ein Operand);
            //DANN fügt er einen Malpunkt ein.
            if ( tokens.length > 0 &&
                !Parser.forbiddenToMultiplyMeTokens.includes(tokens[tokens.length-1]) &&
                !Parser.forbiddenToMultiplyWithMeChars.includes(chr)) {
                //result += "Nach dem Token ".end(tokens).", vor das Zeichen chr setze ich ·<br>";
                tokens.push("·");
            }


            if (Parser.singleCharacterTokens.includes(chr)) {
                tokens.push(chr);
            }
            else if (Parser.numChars.includes(chr)) {
                // entire number as one token
                let number : string = chr;
                let isInt = true;

                while (input.length > i + 1 && Parser.numChars.includes(input[i + 1])) {

                    let digit = input[++i]; //erst hier erhöhen
                    if (digit == '.' || digit == ',') {
                        digit = isInt ? '.' : '';
                        isInt = false;
                    }
                    if (digit != '\'')
                        number += digit;
                }
                tokens.push(parseFloat(number));
            }
            else if (Parser.letterChar.includes(chr)) {
                let text = chr;
                if (text !== 'i') { //itau wird zu i*τ, aber nicht andersherum
                    while (input.length > i + 1 && Parser.letterChar.includes(input[i + 1]))
                        text += input[++i]; //erst hier erhöhen
                }
                if (text in Parser.namedChars)
                    tokens.push(Parser.namedChars[text]);
                else 
                    tokens.push(text);
            }
            else {
                HTMLoutput += `Achtung, das Zeichen ${input[i]} an Stelle ${i}: von "${input}" wurde übergangen (invalid) <br>`;
            }
        }
        return tokens;
    }

    private static precedence(token : string) : number
    {
        if (token in operations)
            return operations[token]['precedence'];
        //; und ) haben -inf Präzedenz, weil sie alles poppen (auswerten lassen), was davor kam.
        //( hat -inf Präzedenz, weil es bei dem Vorgang nicht gepoppt werden darf (Stopper)
        return -1;
    }

    private static parseTokensToRPN(tokens : any[]) : any[]
    {
        let output_queue = [];
        let operator_stack = [];
        let wasOperand = false;

        for (let j = 0; j in tokens; j++) {
            let token = tokens[j];

            if (typeof token == 'number') { //ZAHL
                output_queue.push(token);
                wasOperand = true;
            }
            else if (token in operations) { //OPERATOR / Funktion

                //WENN das letzte Token kein Operand war (Eine Operation oder eine Klammer auf, oder einfach der Anfang)
                //UND dieses Token eine (mindestens) binäre Operation ist
                //UND das nächste Token keine Klammer auf ist (für Präfixnotation der Operation im Stil <operator>(op1;op2)) ;
                //DANN fügt er einen leeren Operanden ein, der für den entsprechenden Standardwert steht (z.b. neutrales Element).
                //Damit kann mann binäre Operationen unär verwenden, z.B. (-baum) : 0-baum oder /z : 1/z
                if(!wasOperand && operations[token]['arity'] >= 2 && !(j+1 in tokens && Parser.leftBraceChars.includes(tokens[j+1]))) {
                    output_queue.push(null);
                    //HTMLoutput += "leerer Operand wurde eingefügt für token <br>";
                }


                //Operatoren mit engerer Bindung (größerer Präzedenz) werden zuerst ausgeführt, d.h. zuerst auf
                //die RPN-Warteschlange geschoben. Bei links-Assoziativität (Links-Gruppierung) werden auch gleichrangige
                //Operatoren, die schon auf dem Operatorstapel sind (weil sie links stehen) zuerst ausgeführt (auf die Queue gelegt)
                let myOP = Parser.precedence(token);
                while (true)
                {
                    if (operator_stack.length == 0)
                        break;

                    let earlierOP = Parser.precedence(operator_stack[operator_stack.length-1]);
                    if (earlierOP > myOP ||
                        (earlierOP == myOP && !('rightAssociative' in operations[operator_stack[operator_stack.length-1]])) )
                        //push higher precedence stuff from stack to output
                        output_queue.push(operator_stack.pop());
                    else
                        break;
                }
                operator_stack.push(token);
                wasOperand = false;

            } else if (Parser.leftBraceChars.includes(token)) { //LINKE KLAMMER
                operator_stack.push('(');
                wasOperand = false;
            } else if (Parser.rightBraceChars.includes(token)) { //RECHTE KLAMMER
                // Alles bis zur linken Klammer & die linke Klammer pop-,pushen
                while (operator_stack[operator_stack.length-1] !== '(') {
                    output_queue.push(operator_stack.pop());
                    if (operator_stack.length == 0) {
                        HTMLoutput += "Zu wenige öffnende Klammern.<br>";
                        //array_pop unten wirft keinen Fehler :)
                        break;
                    }
                }
                // pop the left bracket from the stack.
                operator_stack.pop();
                wasOperand = true;
            }
            else if (Parser.separatorChars.includes(token)) { //KOMMA / ;
                // Alles bis zur linken Klammer pop-,pushen
                if (operator_stack[operator_stack.length-1] !== '(')
                    output_queue.push('');
                while (operator_stack[operator_stack.length-1] !== '(') {
                    output_queue.push(operator_stack.pop());
                    if (operator_stack.length == 0) {
                        HTMLoutput += "Zu wenige öffnende Klammern.<br>";
                        //array_pop unten wirft keinen Fehler :)
                        break;
                    }
                }
                wasOperand = false;
            }
            else {                                          //VARIABLE / KONSTANTE
                //TODO: Hier noch in einzelne Faktoren splitten, falls mehrbuchstabige Variablen nicht erwünscht sind. Dann muss auf in Operations geprüft werden

                output_queue.push(token);
                wasOperand = true;
            }
        }

        //Pop remaining operations / functions
        while (operator_stack.length > 0) {
            let token = operator_stack.pop();
             /* if the operator token on the top of the stack is a bracket, then
            there are mismatched parentheses. */
            if (token == '(') {
                HTMLoutput += "Zu viele öffnende Klammern!<br>";
            }
            else // pop the operator onto the output queue.
                output_queue.push(token);
        }

        return output_queue;
    }

    private static stack : FunktionElement[];
    private static parseRPNToFunktionElement(RPNQueue : any[]) : FunktionElement
    {
        if (RPNQueue.length == 0)
            return Numeric.zero;
        Parser.stack = [];
        for (var index in RPNQueue) {
            let token = RPNQueue[index];
            //HTMLoutput += "Ich verarbeite " + token;
            let funkEl = Parser.parseRPNToFunctionElementInternal(token);
            Parser.stack.push(funkEl);
            //HTMLoutput += " zu ".get_class(funkEl)."-Element: <math displaystyle='true'>" + funkEl.ausgeben() + "</math><br>";
        }

        let result = Parser.stack.pop();
 //Fehlerbehandlung
        if (Parser.stack.length > 0)
            HTMLoutput += "HÄ? {"
                + Parser.stack.map(a =>  a.display()).join(', ')                
                + "} is the stack left after parsing RPNQueue: {"
                +  RPNQueue.join(', ')
                + "}<br>"
            ;

        return result;
    }

    private static parseRPNToFunctionElementInternal(token : string | number | null) : FunktionElement {
        if (token === null)
            return null;
        if (typeof token == "number")
            return Numeric.ofF(token);
        //alert("typeof " + token + "is not number");
        if (token in operations) {
            switch (operations[token]['arity']) {
                case 1:
                    let op = Parser.stack.pop();
                    //instantiates new Object of the type named = value of (operations[token]['name'])
                    return new Function('a', `return new ${operations[token]['name']} (a);`) (op);
                case 2:
                    let o2 = Parser.stack.pop();
                    let o1 = Parser.stack.pop();
                    return new Function('a', 'b', `return new ${operations[token]['name']} (a, b);`) (o1, o2);
                //result += " {Token ".token ." wird geparst mit <math> ".o1.ausgeben() ."</math> und <math>". o2.ausgeben()."</math>] ";
                default:
                    let args = [];
                    for (let i = 0; i < operations[token]['arity']; i++)
                        args.unshift(Parser.stack.pop());
                    return new Function('a', `return new ${operations[token]['name']} (a);`) (args);
            }
        }
        else
            return Variable.ofName(token);
    }
}


Parser.init();