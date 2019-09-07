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
Variable::$registeredVariables = $_SESSION['variables'];
/*
$funktion = $_SESSION['funktion'];
$funktionSimplified = $_SESSION['funktionSimplified'];
$derivative = $_SESSION['derivative'];
$derivativeSimplified = $_SESSION['derivativeSimplified'];
*/

echo "<form><fieldset>";

foreach (Variable::$registeredVariables as $variable) {
    $valN = $variable->value;
    $reF = '';
    $imF = '';
    $mathOutput = '(nicht gesetzt)';
    $output = '';
    if($valN instanceof Numeric) {
        $reF = $valN->reF();
        $imF = $valN->imF();
        $mathOutput = $valN->ausgeben();
        $output = "$reF+{$imF}i";
    }
    /*
    echo "<a> <math> <mi> $variable->name </mi> = ". $valN->ausgeben() ."</math>. Setzte eigenen Wert: <a>
        <input class='II' type='text' id='input_$variable->name' value='$reF' size='8'> <a> + </a>
        <input class='II' type='text' id='input_$variable->name' value='$imF' size='8'> <a>i. Direkt einsetzen: </a>
        <input class='II' type='checkbox' id='check_$variable->name'> <br>
        ";
    */
    echo "<a> <math> <mi> $variable->name </mi> = $mathOutput </math> <label> Setzte eigenen Wert: 
        <input class='II' type='text' id='input_$variable->name' value='$output' size='20'>. </label> <label>Direkt einsetzen:  
        <input class='II' type='checkbox' id='check_$variable->name'> </label><br>
        ";
}

echo "</fieldset></form> <Button onclick=\"loadPHPtoDiv('Ausgabe', 3, true)\"> Aktualisieren </Button>
    ";