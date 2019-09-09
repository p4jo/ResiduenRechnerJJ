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
    global $registeredVariables, $namedFunktionElements;
    $registeredVariables = $_SESSION['variables'];
    $namedFunktionElements = $_SESSION['nFE'];
    foreach ($registeredVariables as $variable){
        if(isset($_POST["input_$variable->name"]) && $_POST["input_$variable->name"] != 'null'
            && $_POST["input_$variable->name"] != $variable->value->inlineAusgeben()) {
            //If User enters expression with variables in it, might be a problem (only isnumeric=true valid).
            //Todo Let User enter expressions that contain variables - that is : other entireFunktions or 0-ary operations
            $variable->value = Parser::parseStringToFunktionElement($_POST["input_$variable->name"])->getValue();
        }
        //echo $_POST["check_$variable->name"];
        $variable->numeric = isset($_POST["check_$variable->name"]) && $_POST["check_$variable->name"]=="true";
        if($variable->numeric)
            echo "Numerischer Wert <math displaystyle='true'>" . $variable->value->ausgeben() . "</math> for variable ". $variable->name ."<br>";
    }

    foreach ($namedFunktionElements as $element){
        if(isset($_POST["input_$variable->name"]) && $_POST["input_$variable->name"] != 'null'
            && $_POST["input_$variable->name"] != $variable->value->inlineAusgeben()) {
            //If User enters expression with variables in it, might be a problem (only isnumeric=true valid).
            //Todo Let User enter expressions that contain variables - that is : other entireFunktions or 0-ary operations
            $variable->value = Parser::parseStringToFunktionElement($_POST["input_$variable->name"])->getValue();
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
    $root = Parser::parseStringToFunktionElement($_POST["formel"]);
    $funktion = new EntireFunktion($root, "f");
}

Variable::$workVariable = $_POST["workVariable"];
if(!$secondCall) {
    echo "NO NUMERIC CONSTANT VARIABLES<br>";
    Variable::$noNumerics = true;
}

echo "Eingabe: " . $funktion->ausgeben();

$funktionSimplified = $funktion->simplified();
echo "Vereinfacht: " . $funktionSimplified->ausgeben();

$derivative = $funktion->derivative();
echo "Abgeleitet: " . $derivative->ausgeben();

$derivativeSimplified = $derivative->simplified();
echo "Abgeleitet & Vereinfacht: " . $derivativeSimplified->ausgeben();

$derivativeOfSimplified = $funktionSimplified->derivative();
echo "Vereinfacht & Abgeleitet: " . $derivativeSimplified->ausgeben();

Variable::$noNumerics = false;

//SAVE THE FUNCTION TO SESSION VARIABLES
$_SESSION['variables'] = $registeredVariables;
$_SESSION['nFE'] = $namedFunktionElements;
//echo implode(",",array_map(function($v){return$v->name;}, $registeredVariables));
if(!$secondCall) {
    $_SESSION['funktion'] = $funktion;
    $_SESSION['funktionSimplified'] = $funktionSimplified;
    $_SESSION['derivative'] = $derivative;
    $_SESSION['derivativeSimplified'] = $derivativeSimplified;
}