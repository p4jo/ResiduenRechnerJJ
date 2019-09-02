<?php

define('LEFT', 0);
define('RIGHT', 1);
require_once "Classes.php";

Parser::init();

class Parser
{
    static $precedence = [
        '(' => 0,
        ')' => 0,
        ';' => 1,
        '+' => 2,
        '-' => 2,
        '/' => 3,
        '÷' => 3,
        ':' => 3,
        '*' => 3,
        '·' => 3,
        '×' => 3,
        '%' => 3,
        '^' => 4
    ];
    static $assoc = [
        '+' => LEFT,
        '-' => LEFT,
        '/' => LEFT,
        '÷' => LEFT,
        ':' => LEFT,
        '*' => LEFT,
        '·' => LEFT,
        '×' => LEFT,
        '%' => LEFT,
        ';' => LEFT,
        '^' => RIGHT
    ];

    // REGEXes
    static $numChar = ['1','2','3','4','5','6','7','8','9','0','.'];
    static $letterChar = Array (0 => 'a', 1 => 'b', 2 => 'c', 3 => 'd', 4 => 'e', 5 => 'f', 6 => 'g', 7 => 'h', 8 => 'i', 9 => 'j', 10 => 'k', 11 => 'l', 12 => 'm', 13 => 'n', 14 => 'o', 15 => 'p', 16 => 'q', 17 => 'r', 18 => 's', 19 => 't', 20 => 'u', 21 => 'v', 22 => 'w', 23 => 'x', 24 => 'y', 25 => 'z', 26 => 'ä', 27 => 'ö', 28 => 'ü', 29 => 'ß', 30 => 'A', 31 => 'B', 32 => 'C', 33 => 'D', 34 => 'E', 35 => 'F', 36 => 'G', 37 => 'H', 38 => 'I', 39 => 'J', 40 => 'K', 41 => 'L', 42 => 'M', 43 => 'N', 44 => 'O', 45 => 'P', 46 => 'Q', 47 => 'R', 48 => 'S', 49 => 'T', 50 => 'U', 51 => 'V', 52 => 'W', 53 => 'X', 54 => 'Y', 55 => 'Z', 56 => 'Ä', 57 => 'Ö', 58 => 'Ü', 59 => 'ς', 60 => 'ε', 61 => 'ρ', 62 => 'τ', 63 => 'υ', 64 => 'θ', 65 => 'ι', 66 => 'ο', 67 => 'π', 68 => 'λ', 69 => 'κ', 70 => 'ξ', 71 => 'η', 72 => 'γ', 73 => 'φ', 74 => 'δ', 75 => 'σ', 76 => 'α', 77 => 'ζ', 78 => 'χ', 79 => 'ψ', 80 => 'ω', 81 => 'β', 82 => 'ν', 83 => 'μ', 84 => 'Ε', 85 => 'Ρ', 86 => 'Τ', 87 => 'Υ', 88 => 'Θ', 89 => 'Ι', 90 => 'Ο', 91 => 'Π', 92 => 'Λ', 93 => 'Κ', 94 => 'Ξ', 95 => 'Η', 96 => 'Γ', 97 => 'Φ', 98 => 'Δ', 99 => 'Σ', 100 => 'Α', 101 => 'Ζ', 102 => 'Χ', 103 => 'Ψ', 104 => 'Ω', 105 => 'Β', 106 => 'Ν', 107 => 'Μ', 108 => 'й', 109 => 'ц', 110 => 'у', 111 => 'к', 112 => 'е', 113 => 'н', 114 => 'г', 115 => 'ш', 116 => 'щ', 117 => 'з', 118 => 'х', 119 => 'э', 120 => 'ж', 121 => 'д', 122 => 'л', 123 => 'о', 124 => 'р', 125 => 'п', 126 => 'а', 127 => 'в', 128 => 'ы', 129 => 'ф', 130 => 'я', 131 => 'ч', 132 => 'с', 133 => 'м', 134 => 'и', 135 => 'т', 136 => 'ь', 137 => 'б', 138 => 'ю', 139 => 'Й', 140 => 'Ц', 141 => 'У', 142 => 'К', 143 => 'Е', 144 => 'Н', 145 => 'Г', 146 => 'Ш', 147 => 'Щ', 148 => 'З', 149 => 'Х', 150 => 'Э', 151 => 'Ж', 152 => 'Д', 153 => 'Л', 154 => 'О', 155 => 'Р', 156 => 'П', 157 => 'А', 158 => 'В', 159 => 'Ы', 160 => 'Ф', 161 => 'Я', 162 => 'Ч', 163 => 'С', 164 => 'М', 165 => 'И', 166 => 'Т', 167 => 'Ь', 168 => 'Б', 169 => 'Ю' ) ;
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
        //So muss man splitten, weil $str[$i] nach bytes geht und von allen 2-Byte Zeichen beide einzeln nimmt,
        // obige Felder wurden indirekt auch so erzeugt
        $input = preg_split('//u', $inputStr, null, PREG_SPLIT_NO_EMPTY);
        // tokenize
        $tokens = [];
        for ($i = 0; isset($input[$i]); $i++) {
            $chr = $input[$i];

            if (ctype_space($chr)) {

            }

            elseif (array_key_exists($chr, self::$precedence)) { //All special characters
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
                while (isset($input[$i + 1]) && in_array($input[$i + 1], self::$numChar))
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
        $wasVariable = -10;
        $warRechteKlammer = -10;

        for ($j = 0; isset($tokens[$j]); $j++) {
            $token = $tokens[$j];

            //Wenn eine rechte Klammer ohne nachfolgenden Operator da ist, muss ein · ergänzt werden
            if($warRechteKlammer == $j - 1 && !key_exists($token, Operation::$operators)) {
                $operator_stack[] = "·";
            }

            if (is_float($token)) { //ZAHL
                $output_queue[] = $token;
            }

            elseif (key_exists($token, Operation::$operators)) { //OPERATOR
                // while there is an operator at the top of the operator stack with
                // greater than or equal to precedence:
                while ($operator_stack &&
                    self::$precedence[end($operator_stack)] >= self::$precedence[$token] + self::$assoc[$token]) {
                    // pop operators from the operator stack, onto the output queue.
                    $output_queue[] = array_pop($operator_stack);
                }
                // push the read operator onto the operator stack.
                if ($token != ',' && $token != ';') //diese "operatoren" sind nur Trenner und haben keine echte Operation, sie lassen nur alles vorherige auswerten
                    $operator_stack[] = $token;

            } elseif ($token == '(') {
                // Wenn eine Klammer nach der Variable kommt, muss ein Malpunkt hin.
                if($wasVariable == $j - 1) {
                    $operator_stack[] = "·";
                }
                $operator_stack[] = $token;
            } elseif ($token == ')') {
                // while the operator at the top of the operator stack is not a left bracket:
                while (end($operator_stack) !== '(') {
                    // pop operators from the operator stack onto the output queue.
                    $output_queue[] = array_pop($operator_stack);
                    /* if the stack runs out without finding a left bracket, then there are
                    mismatched parentheses. */
                    if (!$operator_stack) {
                        throw new InvalidArgumentException("Mismatched parentheses!");
                    }
                }
                $warRechteKlammer = $j;
                // pop the left bracket from the stack.
                array_pop($operator_stack);
            } elseif (Funktion::isFunktionName($token)) {
                $output_queue[] = $token;
            }
            else {
                $output_queue[] = $token;
                $wasVariable = $j;
            }
        }

        //Pop remaining operators / functions
        while ($operator_stack) {
            $token = array_pop($operator_stack);
             /* if the operator token on the top of the stack is a bracket, then
            there are mismatched parentheses. */
            if ($token === '(') {
                throw new InvalidArgumentException("Mismatched parentheses!");
            }
            // pop the operator onto the output queue.
            $output_queue[] = $token;
        }

        echo "RPN: " . implode(" ",$output_queue) . "<br>";

        return $output_queue;
    }

    private static $stack;
    public static function parseRPNToFunctionElement(array $RPNQueue)
    {
        self::$stack = array();
        if (!$RPNQueue)
            return new Numeric(0);
        foreach ($RPNQueue as $token) {
            self::$stack[] = self::parseRPNToFunctionElementInternal($token);

        }

        if (self::$stack || $RPNQueue)
            throw new InvalidArgumentException("HÄ " . self::$stack . "is the stack left, and the RPNQueue is: ".
            $RPNQueue);
    }

    private static function parseRPNToFunctionElementInternal(string $token)
    {
        if (is_float($token))
            return new Numeric($token);
        elseif (key_exists($token, Operation::$operators)){
            $args = array();
            for ($i = 0; $i < (Operation::$operators[$token])::arity; $i++)
                $args[] = array_pop(self::$stack);
            return new Operation::$operators[$token](array_reverse($args));
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