<?php

error_reporting(E_ALL);
ini_set('display_errors', true);
ini_set('html_errors', true);
//DIES IST DAS HAUPTSKRIPT
require_once "Classes.php";
require_once "Parser.php";
require_once "EntireFunktion.php";
require_once "ExplicitOperations.php";

//DATEN LADEN
session_start();
//$_SESSION = [];
$loadData = isset($_POST["loadData"]) && $_POST["loadData"] == "true";


Variable::$workVariable = $_POST["workVariable"];
global $commaIsDecimalPoint;
$commaIsDecimalPoint = isset($_POST["cIDP"]) && $_POST["cIDP"] == "true";

//var_dump($_POST);
if ($loadData) {
    global $registeredVariables;
    $registeredVariables = $_SESSION['variables'];
    foreach ($registeredVariables as $variable) {
        //Aktualisieren, wenn geändert
        //echo $_POST["input_$variable->name"];
        if (isset($_POST["input_$variable->name"]) && $_POST["input_$variable->name"] != 'null' &&
            $_POST["input_$variable->name"] !=
            (($variable->inner != null) ? $variable->inner->inlineAusgeben() : '')) {
            $variable->inner = Parser::parseStringToFunktionElement($_POST["input_$variable->name"]);
        }
        //echo $_POST["check_$variable->name"];
        $variable->useInner = isset($_POST["check_$variable->name"]) && $_POST["check_$variable->name"] == "true";
        if ($variable->useInner())
            echo "Eingesetzter Wert \\(" . $variable->inner->ausgeben() . "\\) für Variable " . $variable->name . "<br>";
    }

    $funktion = $_SESSION['funktion'];
    /*
    $funktion = $_SESSION['funktion'];
    $funktionSimplified = $_SESSION['funktionSimplified'];
    $derivative = $_SESSION['derivative'];
    $derivativeSimplified = $_SESSION['derivativeSimplified'];
    */
}
else {
    echo "Keine Variablen außer i werden eingesetzt.<br>";
    Variable::$noNumerics = true;
    $root = Parser::parseStringToFunktionElement($_POST["formel"]);
    $funktion = new EntireFunktion($root, "f");
}

//RECHNUNG

echo "Eingabe: " . $funktion->ausgeben();

$funktionSimplified = $funktion->simplified();
echo "Vereinfacht: " . $funktionSimplified->ausgeben();

$derivative = $funktionSimplified->derivative();
echo "Abgeleitet: " . $derivative->ausgeben();

$derivativeSimplified = $derivative->simplified();
echo "Ableitung Vereinfacht: " . $derivativeSimplified->ausgeben();

//var_dump($_SESSION);
//SAVE THE FUNCTION TO SESSION VARIABLES
$_SESSION['variables'] = $registeredVariables;
//echo implode(",",array_map(function($v){return$v->name;}, $registeredVariables));
if(!$loadData) {
    $_SESSION['funktion'] = $funktionSimplified;
    $_SESSION['derivative'] = $derivativeSimplified;
    //echo "<br> nachher: ";
    //var_dump($_SESSION);
}