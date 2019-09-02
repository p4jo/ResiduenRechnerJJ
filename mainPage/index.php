<!DOCTYPE html>
	
<html>
	<head>
		<meta charset="utf-8">
		<title>Residuenrechner</title>
<!--		<link rel="stylesheet" type="text/css" href="style.css"/>
		<link rel="shortcut icon" type="image/icon" href="/icon.png"> -->
		<script language="javascript" type="text/javascript" src="../Modellierung/main.js"></script>
	</head>
	<body>
		<h1> Residuenrechner </h1>
				<div>  
				
		<form action="index.php" method="post"> 
			Eingabe:
			<input type="text" id="text" name="formeln"> </textarea>
			<input type="submit" id="submit" name="submit" text="Residuen berechnen" onclick="checkBrowser();" />
		</form> 
		<br><br>

		<P class="blocktext">
<?php
require "Classes.php";
require "Parser.php";
//////////////////////////////////////////////////////////BEGINN SKRIPT

error_reporting(E_ALL);
ini_set('display_errors', true);
ini_set('html_errors', false);


/// ENDE INIT



$input = $_POST['formeln'];
$funktion = new kompletteFunktion(Parser::parseRPNToFunctionElement(Parser::parseStringToRPN($input)));
echo "Funktion gefunden: " . $funktion->ausgeben();
$funktion->vereinfachen();
echo "Vereinfacht:" . $funktion->ausgeben();
echo "Abgelitten:" . $funktion->ableiten()->ausgeben();
echo "Abgelitten & Vereinfacht:" . $funktion->ableiten()->vereinfachen()->ausgeben();


$ausgabe = "noch nichts";

echo "<math>    
           <mpadded>                   
                $ausgabe
           </mpadded>
       </math> <br>";







//////////////////////////////////////////////////////////////////ENDE SKRIPT
			?>
		</p>

		<br>
		<footer>
			<p>&#x00A9; 2019 jgeigers.de</p>
			<p class="foot">
				Diese Website ist noch in Bearbeitung! Einige Funktionen können fehlerhaft sein.
			</p>
			<a href="impressum">Impressum</a>
		</footer>
	</body>
</html>