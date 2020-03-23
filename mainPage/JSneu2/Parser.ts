
var commaIsDecimalPoint = true;


class Parser
{
    // REGEXes
    private static numChars = ['1','2','3','4','5','6','7','8','9','0','.', '\''];
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
        'М', 'И', 'Т', 'Ь', 'Б', 'Ю', '\''];
    //TODO: Vervollständigen
    private static namedChars = {'alpha' : 'α', 'beta' : 'β', 'pi' : 'π', 'tri' : 'ш'};
    private static specialChars : string[];
    private static leftBraceChars : string[] = ['(','[','{','<','«'];
    private static rightBraceChars : string[] = [')',']','}','>','»'];
    private static braceChars : string[];
    private static separatorChars : string[] = [';'];
    private static forbiddenToMultiplyWithMeChars : string[];
    private static forbiddenToMultiplyMeTokens : string[];

    static init()
    {
        if (commaIsDecimalPoint)
            Parser.numChars.push(',');
        else {
            Parser.separatorChars.push(',');
        }
        Parser.braceChars = Parser.leftBraceChars.concat(Parser.rightBraceChars);
        let temp = [
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
        Parser.forbiddenToMultiplyWithMeChars = temp.concat(Parser.rightBraceChars);
        Parser.forbiddenToMultiplyMeTokens = temp.concat(Parser.leftBraceChars, Object.keys(operations));
        Parser.specialChars = temp.concat(Parser.braceChars);
    }


    static parseStringToFunktionElement(inputStr : string) {
        let tokens = Parser.tokenize(inputStr);
        HTMLoutput += "Tokens: " + tokens.join(' ') + "<br>";
        let RPN = Parser.parseTokensToRPN(tokens);
        HTMLoutput += "RPN: " + RPN.join(' ') + "<br>";
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


            if (inObject(chr, Parser.specialChars)) { //All special characters are single tokens
                tokens.push(chr);
            }
            else if (inObject(chr, Parser.numChars)) {
                // entire number as one token
                let number : string = chr;
                let isnumber = true;

                while (input.length > i + 1 && inObject(input[i + 1], Parser.numChars)) {

                    let digit = input[++i]; //erst hier erhöhen
                    if (digit == '.' || digit == ',') {
                        digit = isnumber ? '.' : '';
                        isnumber = false;
                    }
                    if (digit != '\'')
                        number += digit;
                }
                tokens.push(Number.parseFloat(number));
            }
            else if (inObject(chr, Parser.letterChar)) {
                let text = chr;
                while (input.length > i + 1 && inObject(input[i + 1], Parser.letterChar))
                    text += input[++i]; //erst hier erhöhen
                if (text in Parser.namedChars)
                    tokens.push(Parser.namedChars[text]);
                else
                    //TODO: Hier noch in einzelne Faktoren splitten, falls mehrbuchstabige Variablen nicht erwünscht sind. Dann muss auf in Operations geprüft werden
                    tokens.push(text);
            }
            else {
                HTMLoutput += "Achtung das Zeichen " + input[i] + " an Stelle i: von \"" + input + "\" wurde übergangen (invalid)";
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

    private static parseTokensToRPN(tokens : any[]) : string[]
    {
        let output_queue = [];
        let operator_stack = [];
        let wasOperand = false;

        for (let j = 0; j in tokens; j++) {
            let token = tokens[j];

            if (token instanceof Number) { //ZAHL
                output_queue.push(token);
                wasOperand = true;
            }
            else if (token in operations) { //OPERATOR / Funktion

                //WENN das letzte Token kein Operand war (Eine Operation oder eine Klammer auf, oder einfach der Anfang)
                //UND dieses Token eine (mindestens) binäre Operation
                //UND das nächtste Token keine Klammer auf ist (für Präfixnotation der Operation im Stil <operator>(op1;op2)) ;
                //DANN fügt er einen leeren Operanden ein, der für den entsprechenden Standardwert steht (z.b. neutrales Element).
                //Damit kann mann binäre Operationen unär verwenden, z.B. (-baum) : 0-baum oder /z : 1/z
                if(!wasOperand && operations[token]['arity'] >= 2 && !(isset(tokens[j+1]) && inObject(tokens[j+1], Parser.leftBraceChars))) {
                    output_queue.push('');
                    HTMLoutput += "leerer Operand wurde eingefügt für token <br>";
                }


                //Operatoren mit engerer Bindung (größerer Präzedenz) werden zuerst ausgeführt, d.h. zuerst auf
                //die RPN-Warteschlange geschoben. Bei links-Assoziativität (Links-Gruppierung) werden auch gleichrangige
                //Operatoren, die schon auf dem Operatorstapel sind (weil sie links stehen) zuerst ausgeführt (auf die Queue gelegt)
                myOP = Parser.precedence(token);
                while (true)
                {
                    if (!operator_stack)
                        break;

                    earlierOP = Parser.precedence(end(operator_stack));
                    if (earlierOP > myOP ||
                        (earlierOP == myOP && !isset(operations[end(operator_stack)]['rightAssociative'])))
                        //push higher precedence stuff from stack to output
                        output_queue.push(operator_stack.pop());
                    else
                        break;
                }
                operator_stack.push(token);
                wasOperand = false;

            } else if (inObject(token, Parser.leftBraceChars)) { //LINKE KLAMMER
                operator_stack.push('(');
                wasOperand = false;
            } else if (inObject(token, Parser.rightBraceChars)) { //RECHTE KLAMMER
                // Alles bis zur linken Klammer & die linke Klammer pop-,pushen
                while (end(operator_stack) !== '(') {
                    output_queue.push(operator_stack.pop();
                    if (!operator_stack) {
                        HTMLoutput += "Zu wenige öffnende Klammern.<br>";
                        //array_pop unten wirft keinen Fehler :)
                        break;
                    }
                }
                // pop the left bracket from the stack.
                operator_stack.pop();
                wasOperand = true;
            }
            else if (inObject(token,Parser.separatorChars)){ //KOMMA / ;
                // Alles bis zur linken Klammer pop-,pushen
                if (end(operator_stack) !== '(')
                    output_queue.push('');
                while (end(operator_stack) !== '(') {
                    output_queue.push(operator_stack.pop());
                    if (!operator_stack) {
                        HTMLoutput += "Zu wenige öffnende Klammern.<br>";
                        //array_pop unten wirft keinen Fehler :)
                        break;
                    }
                }
                wasOperand = false;
            }
            else {                                          //VARIABLE / KONSTANTE
                output_queue.push(token);
                wasOperand = true;
            }
        }

        //Pop remaining operations / functions
        while (operator_stack) {
            token = operator_stack.pop();
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

    private static stack;
    private static parseRPNToFunktionElement(array RPNQueue) : FunktionElement
    {
        if (!RPNQueue)
            return Numeric.zero;
        Parser.stack = array();
        foreach (RPNQueue as token) {
            //result += "Ich verarbeite " + token;
            funkEl = token === '' ? null : Parser.parseRPNToFunctionElementnumberernal(token);
            Parser.stack.push(funkEl);
            //result += " zu ".get_class(funkEl)."-Element: <math displaystyle='true'>" + funkEl.ausgeben() + "</math><br>";
        }

        HTMLoutput = Parser.stack.pop();
 //Fehlerbehandlung
        if (Parser.stack)
            HTMLoutput +="HÄ? {"
                + implode
                (", ",
                    array_map (
                        (FunktionElement a)
                        {
                            return a.ausgeben();
                        },
                    Parser.stack )
                )
                + "} is the stack left after parsing RPNQueue: {"
                +  implode(", ", RPNQueue )
                + "}<br>"
            ;

        return HTMLoutput;
    }

    private static parseRPNToFunctionElementnumberernal(token)
    {
        if (is_float(token))
            return Numeric.ofF(token);

        global operations;

        if (key_exists(token, operations)){
            switch (operations[token]['arity']) {
                case 1:
                    return new operations[token]['name'](Parser.stack.pop());
                case 2:
                    o2 = Parser.stack.pop();
                    o1 = Parser.stack.pop();
                    //result += " {Token ".token ." wird geparst mit <math> ".o1.ausgeben() ."</math> und <math>". o2.ausgeben()."</math>] ";
                    return new operations[token]['name'](o1, o2);
                default:
                    args = array();
                    for (i = 0; i < operations[token]['arity'}; i++)
                        args.push(Parser.stack.pop());
                    return new operations[token]['name'](array_reverse(args));
            }
        }
        return Variable.ofName(token);
    }

}


Parser.init();