
var commaIsDecimalPoint = true;
var operations = true;



class Parser
{
    // REGEXes
    static numChars = ['1','2','3','4','5','6','7','8','9','0','.', '\''];
    //TODO: Vervollständigen der zulässigen Buchstaben (mit Schriftart abgleichen)
    static letterChar =
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
    static namedChars = {'alpha' : 'α', 'beta' : 'β', 'pi' : 'π', 'tri' : 'ш'};
    static specialChars;
    static leftBraceChars = ['(','[','{','<','«'];
    static rightBraceChars = [')',']','}','>','»'];
    static braceChars;
    static separatorChars = [';'];
    static forbiddenToMultiplyWithMeChars;
    static forbiddenToMultiplyMeTokens;

    static init()
    {
        if (commaIsDecimalPoint)
            this.numChars = ',';
        else {
            this.separatorChars = ',';
        }
        this.braceChars = array_merge(this.leftBraceChars, this.rightBraceChars);
        temp = array_merge(["#","%","&","*","+","-", "/", ":", ";", "?", "@", "^", "_", "|", "~",
            "‖","×","·","¶","±","¤","÷","‼","⌂"], this.separatorChars );
        this.forbiddenToMultiplyWithMeChars = array_merge(temp, this.rightBraceChars);
        this.forbiddenToMultiplyMeTokens = array_merge(temp, this.leftBraceChars, array_keys(operations));
        this.specialChars = array_merge(temp, this.braceChars);
    }


    static parseStringToFunktionElement(inputStr) {
        tokens = this.tokenize(inputStr);
        //TODO
        //alert("Tokens: " + implode(" ", tokens) + "<br>";
        RPN = this.parseTokensToRPN(tokens);
        //TODO
        //alert("RPN: " + implode(" ", RPN) + "<br>";
        return this.parseRPNToFunktionElement(RPN);
    }

    static tokenize(inputStr)
    {
        //So muss man splitten, weil str[i] nach bytes geht und von allen 2-Byte Zeichen beide einzeln nimmt,
        input = preg_split('//u', inputStr, null, PREG_SPLIT_NO_EMPTY);
        //var_dump(input);
        tokens = [];
        for (i = 0; isset(input[i]); i++) {
            chr = input[i];

            if (ctype_space(chr)) {
                continue;
            }

            //WENN der letzte Token kein Operator war, oder eine Klammer zu (also ein Operand)
            //UND der nächste auch kein Operator wird, oder eine Klammer auf (also noch ein Operand);
            //DANN fügt er einen Malpunkt ein.
            if ( tokens &&
                !in_array(end(tokens), this.forbiddenToMultiplyMeTokens) &&
                !in_array(chr,this.forbiddenToMultiplyWithMeChars)) {
                //alert("Nach dem Token ".end(tokens).", vor das Zeichen chr setze ich ·<br>";
                tokens = "·";
            }


            if (in_array(chr, this.specialChars)) { //All special characters are single tokens
                tokens = chr;
            }
            else if (in_array(chr, this.numChars)) {
                // entire number as one token
                number = chr;
                isInt = true;

                while (isset(input[i + 1]) && in_array(input[i + 1], this.numChars)) {

                    digit = input[++i]; //erst hier erhöhen
                    if (digit == '.' || digit == ',') {
                        digit = isInt ? '.' : '';
                        isInt = false;
                    }
                    if (digit != '\'')
                        number += digit;
                }
                //tokens = isInt ? intval(number) : floatval(number) ;
                tokens = floatval(number);
            }
            else if (in_array(chr, this.letterChar)) {
                text = chr;
                while (isset(input[i + 1]) && in_array(input[i + 1], this.letterChar))
                    text += input[++i]; //erst hier erhöhen
                if (key_exists(text, this.namedChars))
                    tokens = this.namedChars[text];
                else
                    //TODO: Hier noch in einzelne Faktoren splitten, falls mehrbuchstabige Variablen nicht erwünscht sind
                    tokens = text;
            }
            else {
                //TODO
                alert("Achtung das Zeichen " + input[i] + " an Stelle i: von \"" + input + "\" wurde übergangen (invalid)");
            }
        }
        return tokens;
    }

    static precedence(token)
    {
        if (isset(operations[token]))
            return operations[token]['precedence'];
        //; und ) haben -inf Präzedenz, weil sie alles poppen (auswerten lassen), was davor kam.
        //( hat -inf Präzedenz, weil es bei dem Vorgang nicht gepoppt werden darf (Stopper)
        return PHP_INT_MIN;
    }

    static parseTokensToRPN(tokens)
    {
        var output_queue = array();
        var operator_stack = array();
        var wasOperand = false;

        for (j = 0; isset(tokens[j]); j++) {
            token = tokens[j];

            if (is_float(token)) { //ZAHL
                output_queue = token;
                wasOperand = true;
            }
            else if (key_exists(token, operations)) { //OPERATOR / Funktion

                //WENN das letzte Token kein Operand war (Eine Operation oder eine Klammer auf, oder einfach der Anfang)
                //UND dieses Token eine (mindestens) binäre Operation
                //UND das nächtste Token keine Klammer auf ist (für Präfixnotation der Operation im Stil <operator>(op1;op2)) ;
                //DANN fügt er einen leeren Operanden ein, der für den entsprechenden Standardwert steht (z.b. neutrales Element).
                //Damit kann mann binäre Operationen unär verwenden, z.B. (-baum) : 0-baum oder /z : 1/z
                if(!wasOperand && operations[token]['arity'] >= 2 && !(isset(tokens[j+1]) && in_array(tokens[j+1], this.leftBraceChars))) {
                    output_queue = '';
                    alert("leerer Operand wurde eingefügt für token <br>");
                }


                //Operatoren mit engerer Bindung (größerer Präzedenz) werden zuerst ausgeführt, d.h. zuerst auf
                //die RPN-Warteschlange geschoben. Bei links-Assoziativität (Links-Gruppierung) werden auch gleichrangige
                //Operatoren, die schon auf dem Operatorstapel sind (weil sie links stehen) zuerst ausgeführt (auf die Queue gelegt)
                myOP = this.precedence(token);
                while (true)
                {
                    if (!operator_stack)
                        break;

                    earlierOP = this.precedence(end(operator_stack));
                    if (earlierOP > myOP ||
                        (earlierOP == myOP && !isset(operations[end(operator_stack)]['rightAssociative'])))
                        //push higher precedence stuff from stack to output
                        output_queue= array_pop(operator_stack);
                    else
                        break;
                }
                operator_stack= token;
                wasOperand = false;

            } else if (in_array(token, this.leftBraceChars)) { //LINKE KLAMMER
                operator_stack = '(';
                wasOperand = false;
            } else if (in_array(token, this.rightBraceChars)) { //RECHTE KLAMMER
                // Alles bis zur linken Klammer & die linke Klammer pop-,pushen
                while (end(operator_stack) !== "(" ) {
                    output_queue = array_pop(operator_stack);
                    if (!operator_stack) {
                        alert("Zu wenige öffnende Klammern.<br>");
                        //array_pop unten wirft keinen Fehler :)
                        break;
                    }
                }
                // pop the left bracket from the stack.
                array_pop(operator_stack);
                wasOperand = true;
            }
            else if (in_array(token,this.separatorChars)){ //KOMMA / ;
                // Alles bis zur linken Klammer pop-,pushen
                if (end(operator_stack) !== '(')
                    output_queue = '';
                while (end(operator_stack) !== '(') {
                    output_queue  = array_pop(operator_stack);
                    if (!operator_stack) {
                        alert("Zu wenige öffnende Klammern.<br>");
                        //array_pop unten wirft keinen Fehler :)
                        break;
                    }
                }
                wasOperand = false;
            }
            else {                                          //VARIABLE / KONSTANTE
                output_queue  = token;
                wasOperand = true;
            }
        }

        //Pop remaining operations / functions
        while (operator_stack) {
            token = array_pop(operator_stack);
             /* if the operator token on the top of the stack is a bracket, then
            there are mismatched parentheses. */
            if (token == '(') {
                alert("Zu viele öffnende Klammern!<br>");
            }
            else // pop the operator onto the output queue.
                output_queue  = token;
        }

        return output_queue;
    }

    static stack;
    static parseRPNToFunktionElement(RPNQueue)
    {
        if (!RPNQueue)
            return Numeric.zero();
        this.stack = array();
        RPNQueue.foreach(function dostuff(token, index) {
            //alert("Ich verarbeite " + token;
            funkEl = token === '' ? null : this.parseRPNToFunctionElementInternal(token);
            this.stack = funkEl;
            //alert(" zu ".get_class(funkEl)."-Element: <math displaystyle='true'>" + funkEl->ausgeben() + "</math><br>";
        });

        result = array_pop(this.stack);
 //Fehlerbehandlung
        if (this.stack)
            alert("HÄ? {"
                + implode
                (", ",
                    array_map (
                        function (a)
                        {
                            return a.ausgeben();
                        },
                    this.stack )
                )
                + "} is the stack left after parsing RPNQueue: {"
                +  implode(", ", RPNQueue )
                + "}<br>"
            );

        return result;
    }

    static parseRPNToFunctionElementInternal(token)
    {
        if (is_float(token))
            return Numeric.ofF(token);


        if (key_exists(token, operations)){
            switch (operations[token]['arity']) {
                case 1:
                    return new operations[token]['name'](array_pop(this.stack));
                case 2:
                    o2 = array_pop(this.stack);
                    o1 = array_pop(this.stack);
                    //alert(" [Token ".token ." wird geparst mit <math> ".o1->ausgeben() ."</math> und <math>". o2->ausgeben()."</math>] ";
                    return new operations[token]['name'](o1, o2);
                default:
                    args = array();
                    for (i = 0; i < operations[token]['arity']; i++)
                        args = array_pop(this.stack);
                    return new operations[token]['name'](array_reverse(args));
            }
        }
        return Variable.ofName(token);
    }

}