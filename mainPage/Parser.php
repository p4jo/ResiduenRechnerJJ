<?php

require_once "Classes.php";
require_once "ExplicitOperations.php";

Parser::init();

class Parser
{
    // REGEXes
    static $numChar = ['1','2','3','4','5','6','7','8','9','0','.'];
    static $letterChar =
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
        'М', 'И', 'Т', 'Ь', 'Б', 'Ю', "'"];
    private static $specialChar = ["#","%","&","*","+","-", "/", ":", ";", "?", "@", "^", "_", "|", "~",
        "‖","×","·","¶","±","¤","÷","‼","⌂"];
    private static $leftBrace = ['(','[','{','<','«'];
    private static $rightBrace = [')',']','}','>','»'];
    private static $brace = ['(','[','{','<','«', ')',']','}','>','»'];
    private static $separator = [';'];

    //TODO: Parser::$commaIsDecimalPoint Sollte von einer Checkbox kommen
    public static $commaIsDecimalPoint = true;
    public static function init()
    {
        if (self::$commaIsDecimalPoint)
            self::$numChar[] = ',';
        else {
            self::$separator[] = ',';
        }
    }


    public static function precedence(string $token)
    {
        global $operations;
        if (isset($operations[$token]))
            return $operations[$token]['precedence'];
        return 0;
    }

    public static function parseStringToRPN(string $inputStr) : array
    {
        global $operations;
        //So muss man splitten, weil $str[$i] nach bytes geht und von allen 2-Byte Zeichen beide einzeln nimmt,
        // obige Felder wurden indirekt auch so erzeugt
        $input = preg_split('//u', $inputStr, null, PREG_SPLIT_NO_EMPTY);

        // tokenize
        $tokens = [];
        for ($i = 0; isset($input[$i]); $i++) {
            $chr = $input[$i];

            if (ctype_space($chr)) {

            }

            elseif (in_array($chr, self::$specialChar) || in_array($chr, self::$brace))
            { //All special characters are single tokens
                $tokens[] = $chr;
            }

            elseif (in_array($chr, self::$numChar)) {
                // entire number as one token
                $number = $chr;
                $isInt = true;

                while (isset($input[$i + 1]) && in_array($input[$i + 1], self::$numChar)) {

                    $digit = $input[++$i]; //erst hier erhöhen
                    if ($digit == ',' || $digit == '.') {
                        $digit = $isInt ? '.' : '';
                        $isInt = false;
                    }
                    $number .= $digit;
                }
                //$tokens[] = $isInt ? intval($number) : floatval($number) ;
                $tokens[] = floatval($number);
            }

            elseif (in_array($chr, self::$letterChar)) {
                $text = $chr;
                while (isset($input[$i + 1]) && in_array($input[$i + 1], self::$letterChar))
                    $text .= $input[++$i]; //erst hier erhöhen
                $tokens[] = $text;
            }

            else {
                throw new InvalidArgumentException("Invalid character at position $i: " . $input[$i] . $input);
            }
        }
        echo "Tokens: " . implode(" ",$tokens) . "<br>";

        $output_queue = array();
        $operator_stack = array();
        $lastType = "";

        for ($j = 0; isset($tokens[$j]); $j++) {
            $token = $tokens[$j];
            //echo "Es kommt gerade der Token " . $token . " ,vorheriger Typ " . $lastType . "<br>";
/*
            //Wenn eine rechte Klammer ohne nachfolgenden Operator da ist, muss ein · ergänzt werden
            if (($lastType == "num" || $lastType == "var" || $lastType == "rB") && !key_exists($token, $operations)) {
                $lastType = 'op';
                $operator_stack[] = "·";
            }
*/
            if (is_float($token)) { //ZAHL
                $lastType = 'num';
                $output_queue[] = $token;
            }
            elseif (in_array($token,self::$separator)){
                $myOP = 0;
                while (true)
                {
                    if (!$operator_stack) break;
                    if (in_array(end($operator_stack),self::$brace) )
                        $output_queue[] = array_pop($operator_stack);
                    else
                        break;
                }
            }
            elseif (key_exists($token, $operations)) { //OPERATOR / Funktion
                $lastType = 'op';
                //Operatoren mit engerer Bindung (größerer Präzedenz) werden zuerst ausgeführt, d.h. zuerst auf
                //die RPN-Warteschlange geschoben. Bei links-Assoziativität (Links-Gruppierung) werden auch gleichrangige
                //Operatoren, die schon auf dem Operatorstapel sind (weil sie links stehen) zuerst ausgeführt (auf die Queue gelegt)
                $myOP = self::precedence($token);
                //echo "pushed operators";
                while (true)
                {
                    if (!$operator_stack) break;
                    //echo end($operator_stack);
                    $earlierOP = self::precedence(end($operator_stack));
                    if ($earlierOP > $myOP || ($earlierOP == $myOP && isset($operations[end($operator_stack)]['rightAssociative'])))
                        //push higher precedence Stuff from stack to output
                        $output_queue[] = array_pop($operator_stack);
                    else
                        break;
                }
                // push the read operator onto the operator stack.
                //echo ",pulled".$token."<br>";
                $operator_stack[] = $token;

            } elseif (in_array($token, self::$leftBrace)) { //LINKE KLAMMER
                $lastType = 'lB';
                $operator_stack[] = $token;
            } elseif (in_array($token, self::$rightBrace)) { //RECHTE KLAMMER
                $lastType = 'rB';
                // while the operator at the top of the operator stack is not a left bracket:
                while (!in_array(end($operator_stack), self::$leftBrace)) {
                    // pop operations from the operator stack onto the output queue.
                    $output_queue[] = array_pop($operator_stack);
                    if (!$operator_stack) {
                        throw new InvalidArgumentException("Mismatched parentheses!");
                    }
                }
                $wasRightBrace = $j;
                // pop the left bracket from the stack.
                array_pop($operator_stack);

            }
            /* elseif (Funktion::isFunktionName($token)) {   //FUNKTION
                $lastType = 'funk';
                $output_queue[] = $token;
            }*/
            else {                                          //VARIABLE / KONSTANTE
                $lastType = 'var';
                $output_queue[] = $token;
            }
        }

        //Pop remaining operations / functions
        while ($operator_stack) {
            $token = array_pop($operator_stack);
             /* if the operator token on the top of the stack is a bracket, then
            there are mismatched parentheses. */
            if ($token == '(') {
                throw new InvalidArgumentException("Mismatched parentheses!");
            }
            // pop the operator onto the output queue.
            $output_queue[] = $token;
        }

        echo "RPN: " . implode(" ", $output_queue) . "<br>";

        return $output_queue;
    }

    private static $stack;
    public static function parseRPNToFunktionElement(array $RPNQueue) : FunktionElement
    {
        if (!$RPNQueue)
            return Numeric::zero();
        self::$stack = array();
        foreach ($RPNQueue as $token) {
            echo "Ich verarbeite " . $token;
            $funkEl = self::parseRPNToFunctionElementInternal($token);
            self::$stack[] = $funkEl;
            echo " zu ".get_class($funkEl)."-Element: <math displaystyle='true'>" . $funkEl->ausgeben() . "</math><br>";
        }

        $result = array_pop(self::$stack);
 //Fehlerbehandlung
        if (self::$stack)
            throw new InvalidArgumentException("HÄ {"
                . implode
                (", ",
                    array_map (
                        function (FunktionElement $a)
                        {
                            return $a->ausgeben();
                        },
                    self::$stack )
                )
                . "} is the stack left after parsing RPNQueue: {"
                .  implode(", ", $RPNQueue )
                . "}"
            );

        return $result;
    }

    private static function parseRPNToFunctionElementInternal($token)
    {
        if (is_float($token))
            return Numeric::ofF($token);

        global $operations;

        if (key_exists($token, $operations)){
            switch ($operations[$token]['arity']) {
                case 1:
                    return new $operations[$token]['name'](array_pop(self::$stack));
                case 2:
                    $o2 = array_pop(self::$stack);
                    $o1 = array_pop(self::$stack);
                    echo " [Token ".$token ." wird geparst mit <math> ".$o1->ausgeben() ."</math> und <math>". $o2->ausgeben()."</math>] ";
                    return new $operations[$token]['name']($o1, $o2);
                default:
                    $args = array();
                    for ($i = 0; $i < $operations[$token]['arity']; $i++)
                        $args[] = array_pop(self::$stack);
                    return new $operations[$token]['name'](array_reverse($args));
            }
        }
        return Variable::ofName($token);
    }

}