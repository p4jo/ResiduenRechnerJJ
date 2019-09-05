<?php

error_reporting(E_ALL);
ini_set('display_errors', true);
ini_set('html_errors', false);

require_once "Parser.php";
require_once "Classes.php";
require_once "GeneralStuff.php";
require_once "ExplicitOperations.php";

/// Obige Dateien sollten keinen HTML-Code erzeugen (Schichtenarchitektur)
ausgabe($_POST["inputString"]);
function ausgabe($input): void
{

    $RPNQueue = Parser::parseStringToRPN($input);
    $root = Parser::parseRPNToFunktionElement($RPNQueue);
    $funktion = new EntireFunktion($root);
    echo "Funktion gefunden: " . $funktion->ausgeben();
    $funktion->simplifyNoConstVar();
    echo "Vereinfacht:" . $funktion->ausgeben();
    $derivative = $funktion->ableiten();
    echo "Abgelitten:" . $derivative->ausgeben();
    echo "Abgelitten & Vereinfacht:" . $derivative->simplifyNoConstVar()->ausgeben();


    $ausgabe = "Ausgabe: noch nichts";

    echo "<math>  <mpadded>
                $ausgabe
           </mpadded> </math> <br>";
}
