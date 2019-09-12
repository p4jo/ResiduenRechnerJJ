<?php

error_reporting(E_ALL);
ini_set('display_errors', true);
ini_set('html_errors', false);

require_once "Parser.php";
require_once "Classes.php";
require_once "EntireFunktion.php";
require_once "ExplicitOperations.php";

session_start();

//LOAD FROM SESSION VARIABLES
global $registeredVariables;
$registeredVariables = $_SESSION['variables'];
global $commaIsDecimalPoint;
$commaIsDecimalPoint = isset($_POST["cIDP"]) && $_POST["cIDP"] == "true";
/*
$funktion = $_SESSION['funktion'];
$funktionSimplified = $_SESSION['funktionSimplified'];
$derivative = $_SESSION['derivative'];
$derivativeSimplified = $_SESSION['derivativeSimplified'];
*/

echo "<form><fieldset>";

foreach ($registeredVariables as $variable) {
    $valN = $variable->inner;
    $mathOutput = '(nicht gesetzt)';
    $output = '';
    if($valN instanceof FunktionElement) {
        $mathOutput = $valN->ausgeben();
        $output = $valN->inlineAusgeben();
    }
    /*
    echo "<a> <math> <mi> $variable->name </mi> = ". $valN->ausgeben() ."</math>. Setzte eigenen Wert: <a>
        <input class='II' type='text' id='input_$variable->name' value='$reF' size='8'> <a> + </a>
        <input class='II' type='text' id='input_$variable->name' value='$imF' size='8'> <a>i. Direkt einsetzen: </a>
        <input class='II' type='checkbox' id='check_$variable->name'> <br>
        ";
    */
    echo "<math> <mi> $variable->name </mi> = $mathOutput </math>. 
    <label> Setzte eigenen Wert: 
        <input class='II' type='text' id='input_$variable->name' value='$output' size='20'>. 
    </label> 
    <label>Direkt einsetzen:  
        <input class='II' type='checkbox' id='check_$variable->name' ". ($variable->useInner() ? "checked='checked'" : '') .">
    </label>
        <br>";
}
/*
echo "</fieldset>Ausdrücke können hier unten eigegeben werden.<fieldset>";

foreach ($namedFunktionElements as $name => $funkEl) {
    $valN = $funkEl;
    $mathOutput = '(nicht gesetzt)';
    $output = '';
    if($valN instanceof FunktionElement) {
        $mathOutput = $valN->ausgeben();
        $output = $valN->inlineAusgeben();
    }
    /*
    echo "<a> <math> <mi> $variable->name </mi> = ". $valN->ausgeben() ."</math>. Setzte eigenen Wert: <a>
        <input class='II' type='text' id='input_$variable->name' value='$reF' size='8'> <a> + </a>
        <input class='II' type='text' id='input_$variable->name' value='$imF' size='8'> <a>i. Direkt einsetzen: </a>
        <input class='II' type='checkbox' id='check_$variable->name'> <br>
        ";

    echo "<math> <mi> $name </mi> <mo>=</mo> $mathOutput </math>
    <label> Setzte eigenen Wert: 
        <input class='II' type='text' id='input_$name' value='$output' size='30'>. 
    </label> 
        <br>";
}
*/

echo "</fieldset></form>
        <Button onclick=\"reloadSecondArea()\"> Aktualisieren </Button>
    ";