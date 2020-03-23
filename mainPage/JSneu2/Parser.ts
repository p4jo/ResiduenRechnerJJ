
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
    private static specialChars;
    private static leftBraceChars = ['(','[','{','<','«'];
    private static rightBraceChars = [')',']','}','>','»'];
    private static braceChars;
    private static separatorChars = [';'];
    private static forbiddenToMultiplyWithMeChars;
    private static forbiddenToMultiplyMeTokens;

    static init()
    {
        if (commaIsDecimalPoint)
            self.numChars.push(',');
        else {
            self.separatorChars.push(',');
        }
        self.braceChars = array_merge(self.leftBraceChars, self.rightBraceChars);
        temp = [
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
    ].concat( self.separatorChars );
        self.forbiddenToMultiplyWithMeChars = array_merge(temp, self.rightBraceChars);
        self.forbiddenToMultiplyMeTokens = array_merge(temp, self.leftBraceChars, array_keys(operations));
        self.specialChars = array_merge(temp, self.braceChars);
    }


    static parseStringToFunktionElement(string inputStr) {
        tokens = self.tokenize(inputStr);
        result += "Tokens: " + implode(" ", tokens) + "<br>";
        RPN = self.parseTokensToRPN(tokens);
        result += "RPN: " + implode(" ", RPN) + "<br>";
        return self.parseRPNToFunktionElement(RPN);
    }

    private static tokenize(string inputStr) : array
    {
        //So muss man splitten, weil str[i] nach bytes geht und von allen 2-Byte Zeichen beide einzeln nimmt,
        input = preg_split('//u', inputStr, null, PREG_SPLIT_NO_EMPTY);
        //var_dump(input);
        tokens = {};
        for (i = 0; isset(input[i]); i++) {
            chr = input[i};

            if (ctype_space(chr)) {
                continue;
            }

            //WENN der letzte Token kein Operator war, oder eine Klammer zu (also ein Operand)
            //UND der nächste auch kein Operator wird, oder eine Klammer auf (also noch ein Operand);
            //DANN fügt er einen Malpunkt ein.
            if ( tokens &&
                !in_array((string) end(tokens), self.forbiddenToMultiplyMeTokens) &&
                !in_array(chr,self.forbiddenToMultiplyWithMeChars)) {
                //result += "Nach dem Token ".end(tokens).", vor das Zeichen chr setze ich ·<br>";
                tokens.push("·");
            }


            if (in_array(chr, self.specialChars)) { //All special characters are single tokens
                tokens.push(chr);
            }
            else if (in_array(chr, self.numChars)) {
                // entire number as one token
                number = chr;
                isnumber = true;

                while (isset(input[i + 1]) && in_array(input[i + 1], self.numChars)) {

                    digit = input[++i}; //erst hier erhöhen
                    if (digit == '.' || digit == ',') {
                        digit = isnumber ? '.' : '';
                        isnumber = false;
                    }
                    if (digit != '\'')
                        number .= digit;
                }
                //tokens.push(isnumber ? numberval(number) : floatval(number)) ;
                tokens.push(floatval(number));
            }
            else if (in_array(chr, self.letterChar)) {
                text = chr;
                while (isset(input[i + 1]) && in_array(input[i + 1], self.letterChar))
                    text .= input[++i}; //erst hier erhöhen
                if (key_exists(text, self.namedChars))
                    tokens.push(self.namedChars[text});
                else
                    //TODO: Hier noch in einzelne Faktoren splitten, falls mehrbuchstabige Variablen nicht erwünscht sind
                    tokens.push(text);
            }
            else {
                result += "Achtung das Zeichen " + input[i] + " an Stelle i: von \"" + input + "\" wurde übergangen (invalid)";
            }
        }
        return tokens;
    }

    private static precedence(string token)
    {
        global operations;
        if (isset(operations[token]))
            return operations[token]['precedence'};
        //; und ) haben -inf Präzedenz, weil sie alles poppen (auswerten lassen), was davor kam.
        //( hat -inf Präzedenz, weil es bei dem Vorgang nicht gepoppt werden darf (Stopper)
        return PHP_number_MIN;
    }

    private static parseTokensToRPN(array tokens) : array
    {
        global operations;
        output_queue = array();
        operator_stack = array();
        wasOperand = false;

        for (j = 0; isset(tokens[j]); j++) {
            token = tokens[j};

            if (is_float(token)) { //ZAHL
                output_queue.push(token);
                wasOperand = true;
            }
            else if (key_exists(token, operations)) { //OPERATOR / Funktion

                //WENN das letzte Token kein Operand war (Eine Operation oder eine Klammer auf, oder einfach der Anfang)
                //UND dieses Token eine (mindestens) binäre Operation
                //UND das nächtste Token keine Klammer auf ist (für Präfixnotation der Operation im Stil <operator>(op1;op2)) ;
                //DANN fügt er einen leeren Operanden ein, der für den entsprechenden Standardwert steht (z.b. neutrales Element).
                //Damit kann mann binäre Operationen unär verwenden, z.B. (-baum) : 0-baum oder /z : 1/z
                if(!wasOperand && operations[token]['arity'] >= 2 && !(isset(tokens[j+1]) && in_array(tokens[j+1], self.leftBraceChars))) {
                    output_queue.push('');
                    result += "leerer Operand wurde eingefügt für token <br>";
                }


                //Operatoren mit engerer Bindung (größerer Präzedenz) werden zuerst ausgeführt, d.h. zuerst auf
                //die RPN-Warteschlange geschoben. Bei links-Assoziativität (Links-Gruppierung) werden auch gleichrangige
                //Operatoren, die schon auf dem Operatorstapel sind (weil sie links stehen) zuerst ausgeführt (auf die Queue gelegt)
                myOP = self.precedence(token);
                while (true)
                {
                    if (!operator_stack)
                        break;

                    earlierOP = self.precedence(end(operator_stack));
                    if (earlierOP > myOP ||
                        (earlierOP == myOP && !isset(operations[end(operator_stack)]['rightAssociative'])))
                        //push higher precedence stuff from stack to output
                        output_queue.push(operator_stack.pop());
                    else
                        break;
                }
                operator_stack.push(token);
                wasOperand = false;

            } else if (in_array(token, self.leftBraceChars)) { //LINKE KLAMMER
                operator_stack.push('(');
                wasOperand = false;
            } else if (in_array(token, self.rightBraceChars)) { //RECHTE KLAMMER
                // Alles bis zur linken Klammer & die linke Klammer pop-,pushen
                while (end(operator_stack) !== '(') {
                    output_queue.push(operator_stack.pop();
                    if (!operator_stack) {
                        result += "Zu wenige öffnende Klammern.<br>";
                        //array_pop unten wirft keinen Fehler :)
                        break;
                    }
                }
                // pop the left bracket from the stack.
                operator_stack.pop();
                wasOperand = true;
            }
            else if (in_array(token,self.separatorChars)){ //KOMMA / ;
                // Alles bis zur linken Klammer pop-,pushen
                if (end(operator_stack) !== '(')
                    output_queue.push('');
                while (end(operator_stack) !== '(') {
                    output_queue.push(operator_stack.pop());
                    if (!operator_stack) {
                        result += "Zu wenige öffnende Klammern.<br>";
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
                result += "Zu viele öffnende Klammern!<br>";
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
            return Numeric.zero();
        self.stack = array();
        foreach (RPNQueue as token) {
            //result += "Ich verarbeite " + token;
            funkEl = token === '' ? null : self.parseRPNToFunctionElementnumberernal(token);
            self.stack.push(funkEl);
            //result += " zu ".get_class(funkEl)."-Element: <math displaystyle='true'>" + funkEl.ausgeben() + "</math><br>";
        }

        result = self.stack.pop();
 //Fehlerbehandlung
        if (self.stack)
            result +="HÄ? {"
                + implode
                (", ",
                    array_map (
                        (FunktionElement a)
                        {
                            return a.ausgeben();
                        },
                    self.stack )
                )
                + "} is the stack left after parsing RPNQueue: {"
                +  implode(", ", RPNQueue )
                + "}<br>"
            ;

        return result;
    }

    private static parseRPNToFunctionElementnumberernal(token)
    {
        if (is_float(token))
            return Numeric.ofF(token);

        global operations;

        if (key_exists(token, operations)){
            switch (operations[token]['arity']) {
                case 1:
                    return new operations[token]['name'](self.stack.pop());
                case 2:
                    o2 = self.stack.pop();
                    o1 = self.stack.pop();
                    //result += " {Token ".token ." wird geparst mit <math> ".o1.ausgeben() ."</math> und <math>". o2.ausgeben()."</math>] ";
                    return new operations[token]['name'](o1, o2);
                default:
                    args = array();
                    for (i = 0; i < operations[token]['arity'}; i++)
                        args.push(self.stack.pop());
                    return new operations[token]['name'](array_reverse(args));
            }
        }
        return Variable.ofName(token);
    }

}


Parser.init();