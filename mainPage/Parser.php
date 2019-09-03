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

    public static $commaIsDecimalPoint = true;
    public static function init()
    {
        if (self::$commaIsDecimalPoint)
            self::$numChar[] = ',';
        else {
            self::$assoc[','] = LEFT;
            self::$precedence[','] = 1;
        }
    }


    public static function parseStringToRPN($inputStr)
    {
        global $operators;
        //So muss man splitten, weil $str[$i] nach bytes geht und von allen 2-Byte Zeichen beide einzeln nimmt,
        // obige Felder wurden indirekt auch so erzeugt
        $input = preg_split('//u', $inputStr, null, PREG_SPLIT_NO_EMPTY);

        // tokenize
        $tokens = [];
        for ($i = 0; isset($input[$i]); $i++) {
            $chr = $input[$i];

            if (ctype_space($chr)) {

            }

            elseif (in_array($chr, self::$specialChar) || in_array($chr, self::$leftBrace) || in_array($chr,self::$rightBrace))
            { //All special characters are single tokens
                $tokens[] = $chr;
            }

            elseif (in_array($chr, self::$numChar)) {
                // entire number as one token
                $number = $chr;

                while (isset($input[$i + 1]) && in_array($input[$i + 1], self::$numChar)) {

                    $digit = $input[++$i]; //erst hier erhöhen
                    if ($digit == ',')
                        $digit = '.';
                    $number .= $digit;
                }
                //probably throws Exception with more than one . or ,
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

            //Wenn eine rechte Klammer ohne nachfolgenden Operator da ist, muss ein · ergänzt werden
            if (($lastType == "num" || $lastType == "var" || $lastType == "rB") && !key_exists($token, $operators)) {
                $lastType = 'op';
                $operator_stack[] = "·";
            }

            if (is_float($token)) { //ZAHL
                $lastType = 'num';
                $output_queue[] = $token;
            }
            elseif (key_exists($token, $operators)) { //OPERATOR
                $lastType = 'op';
                //Operatoren mit engerer Bindung (größerer Präzedenz) werden zuerst ausgeführt, d.h. zuerst auf
                //die RPN-Warteschlange geschoben. Bei links-Assoziativität (Links-Gruppierung) werden auch gleichrangige
                //Operatoren, die schon auf dem Operatorstapel sind (weil sie links stehen) zuerst ausgeführt (auf die Queue gelegt)
                $myOP = $operators[$token]['precedence'];
                while (true)
                {
                    if (!$operator_stack) break;
                    $earlierOP = $operators[end($operator_stack)]['precedence'];
                    if ($earlierOP > $myOP || ($earlierOP == $myOP && isset($operators[end($operator_stack)]['rightAssociative'])))
                        $output_queue[] = array_pop($operator_stack);
                }
                // push the read operator onto the operator stack.
                if ($token != ',' && $token != ';') //diese "operatoren" sind nur Trenner und haben keine echte Operation, sie lassen nur alles vorherige auswerten
                    $operator_stack[] = $token;

            } elseif (in_array($token, self::$leftBrace)) { //LINKE KLAMMER
                $lastType = 'lB';
                $operator_stack[] = $token;
            } elseif (in_array($token, self::$rightBrace)) { //RECHTE KLAMMER
                $lastType = 'rB';
                // while the operator at the top of the operator stack is not a left bracket:
                while (!in_array(end($operator_stack), self::$leftBrace)) {
                    // pop operators from the operator stack onto the output queue.
                    $output_queue[] = array_pop($operator_stack);
                    if (!$operator_stack) {
                        throw new InvalidArgumentException("Mismatched parentheses!");
                    }
                }
                $wasRightBrace = $j;
                // pop the left bracket from the stack.
                array_pop($operator_stack);
            } elseif (Funktion::isFunktionName($token)) {   //FUNKTION
                $lastType = 'funk';
                $output_queue[] = $token;
            }
            else {                                          //VARIABLE / KONSTANTE
                $lastType = 'var';
                $output_queue[] = $token;
            }
        }

        //Pop remaining operators / functions
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
    public static function parseRPNToFunctionElement(array $RPNQueue)
    {
        if (!$RPNQueue)
            return new Numeric(0);
        self::$stack = array();
        foreach ($RPNQueue as $token) {
            self::$stack[] = self::parseRPNToFunctionElementInternal($token);
        }

        if (self::$stack || $RPNQueue)
            throw new InvalidArgumentException("HÄ " . self::$stack . "is the stack left, and the RPNQueue is: ".
            $RPNQueue);
    }

    private static function parseRPNToFunctionElementInternal(string $token)
    {
        global $operators;
        if (is_float($token))
            return new Numeric($token);
        elseif (key_exists($token, $operators)){
            $args = array();
            for ($i = 0; $i < $operators[$token]['arity']; $i++)
                $args[] = array_pop(self::$stack);
            return new $operators[$token]['name'](array_reverse($args));
        }
        elseif (Funktion::isFunktionName($token)) {
            $args = array();
            for ($i = 0; $i < $token::$arity; $i++)
                $args[] = array_pop(self::$stack);
            return Funktion::ofName($token,array_reverse(args));
        }
        else
            //Enthält Konstanten
            return Variable::ofName($token);
    }
}