<?php

error_reporting(E_ALL);
ini_set('display_errors', true);
ini_set('html_errors', false);

require_once "Parser.php";
require_once "Classes.php";
require_once "EntireFunktion.php";
require_once "ExplicitOperations.php";

session_start();
$secondCall = isset($_POST["loadData"]) && $_POST["loadData"] == "true";
//var_dump($_POST);
if ($secondCall) {
    Variable::$registeredVariables = $_SESSION['variables'];
    foreach (Variable::$registeredVariables as $variable){
        //todo only if changed
        if(isset($_POST["input_$variable->name"]) && $_POST["input_$variable->name"] != 'null') {
            //If User enters expression with variables in it, might be a problem (only isnumeric=true valid).
            //Todo Let User enter expressions that contain variables - that is : other entireFunktions or 0-ary operations
            $variable->value = Parser::parseRPNToFunktionElement(Parser::parseStringToRPN($_POST["input_$variable->name"]))->getValue();
        }
        //echo $_POST["check_$variable->name"];
        $variable->numeric = isset($_POST["check_$variable->name"]) && $_POST["check_$variable->name"]=="true";
        if($variable->numeric)
            echo "Numerischer Wert <math displaystyle='true'>" . $variable->value->ausgeben() . "</math> for variable ". $variable->name ."<br>";
    }

    $funktion = $_SESSION['funktionSimplified'];
    /*
    $funktion = $_SESSION['funktion'];
    $funktionSimplified = $_SESSION['funktionSimplified'];
    $derivative = $_SESSION['derivative'];
    $derivativeSimplified = $_SESSION['derivativeSimplified'];
    */
}
else {
    $RPNQueue = Parser::parseStringToRPN($_POST["formel"]);
    $root = Parser::parseRPNToFunktionElement($RPNQueue);
    $funktion = new EntireFunktion($root, "f");
}

Variable::$workVariable = $_POST["workVariable"];
if(!$secondCall) {
    echo "NO NUMERIC CONSTANT VARIABLES<br>";
    Variable::$noNumerics = true;
}

echo "Eingabe: " . $funktion->ausgeben();

$funktionSimplified = $funktion->simplify();
echo "Vereinfacht: " . $funktionSimplified->ausgeben();

$derivative = $funktion->ableiten();
echo "Abgeleitet: " . $derivative->ausgeben();

$derivativeSimplified = $derivative->simplify();
echo "Abgeleitet & Vereinfacht: " . $derivativeSimplified->ausgeben();

$derivativeOfSimplified = $funktionSimplified->ableiten();
echo "Vereinfacht & Abgeleitet: " . $derivativeSimplified->ausgeben();

Variable::$noNumerics = false;

//SAVE THE FUNCTION TO SESSION VARIABLES
$_SESSION['variables'] = Variable::$registeredVariables;
//echo implode(",",array_map(function($v){return$v->name;}, Variable::$registeredVariables));
if(!$secondCall) {
    $_SESSION['funktion'] = $funktion;
    $_SESSION['funktionSimplified'] = $funktionSimplified;
    $_SESSION['derivative'] = $derivative;
    $_SESSION['derivativeSimplified'] = $derivativeSimplified;
}