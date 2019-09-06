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

echo "<form>";

foreach (Variable::$registeredVariables as $variable) {
    echo " <a> $variable->name = <a>
        <input class='II' type='text' id='input_$variable->name' size='6'>
        
        ";
}
