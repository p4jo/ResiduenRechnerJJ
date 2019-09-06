<?php

error_reporting(E_ALL);
ini_set('display_errors', true);
ini_set('html_errors', false);

require_once "Parser.php";
require_once "Classes.php";
require_once "EntireFunktion.php";
require_once "ExplicitOperations.php";

/// Obige Dateien sollten keinen HTML-Code erzeugen (Schichtenarchitektur)

session_start();

$input = $_POST["formel"];
Variable::$workVariable = $_POST["workVariable"];

$RPNQueue = Parser::parseStringToRPN($input);
$root = Parser::parseRPNToFunktionElement($RPNQueue);
$funktion = new EntireFunktion($root);

Variable::$noNumerics = true;
echo "NO NUMERIC CONSTANT VARIABLES<br>";

echo "Eingabe: " . $funktion->ausgeben();

$funktionSimplified = $funktion->simplify();
echo "Vereinfacht:" . $funktionSimplified->ausgeben();

$derivative = $funktion->ableiten();
echo "Abgeleitet:" . $derivative->ausgeben();

$derivativeSimplified = $derivative->simplify();
echo "Abgeleitet & Vereinfacht:" . $derivativeSimplified->ausgeben();

$derivativeOfSimplified = $funktionSimplified->ableiten();
echo "Vereinfacht & Abgeleitet:" . $derivativeSimplified->ausgeben();

Variable::$noNumerics = false;

//SAVE THE FUNCTION TO SESSION VARIABLES
$_SESSION['variables'] = Variable::$registeredVariables;
$_SESSION['funktion'] = $funktion;
$_SESSION['funktionSimplified'] = $funktionSimplified;
$_SESSION['derivative'] = $derivative;
$_SESSION['derivativeSimplified'] = $derivativeSimplified;