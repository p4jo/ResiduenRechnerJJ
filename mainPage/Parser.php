<?php
require "Classes.php";

define('LEFT', 0);
define('RIGHT', 1);

class Parser
{
    static array $precedence = [
        '(' => 0,
        ')' => 0,
        '+' => 2,
        '-' => 2,
        '/' => 3,
        '*' => 3,
        '%' => 3,
        '^' => 4
    ];
    static array $assoc = [
        '+' => LEFT,
        '-' => LEFT,
        '/' => LEFT,
        '*' => LEFT,
        '%' => LEFT,
        '^' => RIGHT
    ];

    // REGEXes
    static array $operators = (array)"+-/*%^";
    static array $numChar = (array)"0123456789.,";
    static array $letterChar = (array)"abcdefghijklmnopqrstuvwxyzäöüßABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜςερτυθιοπλκξηγφδσαζχψωβνμΕΡΤΥΘΙΟΠΛΚΞΗΓΦΔΣΑΖΧΨΩΒΝΜйцукенгшщзхэждлорпавыфячсмитьбюЙЦУКЕНГШЩЗХЭЖДЛОРПАВЫФЯЧСМИТЬБЮ";

    public static function parseStringToRPN($input)
    {
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
                // entre number as one token
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
                throw new \http\Exception\InvalidArgumentException("Invalid character at position $i: $input[$i]\n$input\n" .
                    str_pad('^', $i + 1, ' ', STR_PAD_LEFT));
            }
        }
        echo "Tokens: " . implode(" ",$tokens);

        $output_queue = array();
        $operator_stack = array();
        $wasText = -10;

        for ($j = 0; isset($tokens[$j]); $j++) {
            $token = $tokens[$j];

            if (is_float($token)) {
                $output_queue[] = $token;
            }

            elseif (in_array($token, self::$operators)) {
                // while there is an operator at the top of the operator stack with
                // greater than or equal to precedence:
                while ($operator_stack &&
                    self::$precedence[end($operator_stack)] >= self::$precedence[$token] + self::$assoc[$token]) {
                    // pop operators from the operator stack, onto the output queue.
                    $output_queue[] = array_pop($operator_stack);
                }
                // push the read operator onto the operator stack.
                $operator_stack[] = $token;

            } elseif ($token == '(') {
                // push it onto the operator stack.
                $operator_stack[] = $token;
                // Wenn eine Klammer nach dem Text kommt, ist es eine Funktion, keine Variable.
                // Später müssen nicht definierte Funktionen wie z( oder arg( oder γ( als Variable mal ( umgesetzt werden
                if($wasText == $j - 1) {
                    $tokens[$wasText] = '§' . $tokens[$wasText];
                }
            } elseif ($token == ')') {
                // while the operator at the top of the operator stack is not a left bracket:
                while (end($operator_stack) !== '(') {
                    // pop operators from the operator stack onto the output queue.
                    $output_queue[] = array_pop($operator_stack);
                    /* if the stack runs out without finding a left bracket, then there are
                    mismatched parentheses. */
                    if (!$operator_stack) {
                        throw new \http\Exception\InvalidArgumentException("Mismatched parentheses!");
                    }
                }
                // pop the left bracket from the stack.
                array_pop($operator_stack);
            } else {
                $output_queue[] = $token;
                $wasText = $j;
            }
        }

        //Pop remaining operators / functions
        while ($operator_stack) {
            $token = array_pop($operator_stack);
             /* if the operator token on the top of the stack is a bracket, then
            there are mismatched parentheses. */
            if ($token === '(') {
                throw new \http\Exception\InvalidArgumentException("Mismatched parentheses!");
            }
            // pop the operator onto the output queue.
            $output_queue[] = $token;
        }

        echo "RPN: " . implode(" ",$output_queue);

        return $output_queue;
    }

    private static array $stack;
    public static function parseRPNToFunctionElement(array $RPNQueue)
    {
        self::$stack = array();
        if (!$RPNQueue)
            return new Numeric(0);
        while ($RPNQueue) {
            $a = array_shift($RPNQueue);

        }
        if (self::$stack)
            throw new \http\Exception\InvalidArgumentException("HÄ");
    }
    
    private static function parseRPNToFunctionElementInternal(string $token)
    {
        if (is_float($token))
            return new Numeric($token);
        elseif (key_exists($token, self::$operators)){
            $args = array();
            for ($i = 0; $i < self::$operators[$token]->arity; $i++)
                $args[] = parseRPNToFunctionElementInternal(array_pop(self::$stack));
            return new self::$operators[$token](args);
        }
        elseif ($token[0] == '§') {
            $args = array();
            for ($i = 0; $i < self::$operators[$token]->arity; $i++)
                $args[] = parseRPNToFunctionElementInternal(array_pop(self::$stack));
            return Funktion::ofName(substr($token, 1), args);
        }
        else
            return Variable::ofName($token);
    }
}