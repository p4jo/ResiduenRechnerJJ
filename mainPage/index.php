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

        <form method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">
            <textarea cols="70" rows="1" name="formel" id="update" maxlength="200" ></textarea>
            <br />
            <input name="submit_button" type="submit"  value=" Residuen berechnen "  id="update_button"  class="update_button"/>
        </form>

        <?php
        require_once "Parser.php";
        require_once "Classes.php";


        error_reporting(E_ALL);
        ini_set('display_errors', true);
        ini_set('html_errors', false);


        /// ENDE INIT

        // check if the form was submitted
        if (isset($_POST['submit_button']) && $_POST['submit_button']) {

            $input = $_POST['formel'];
            $funktion = new kompletteFunktion(Parser::parseRPNToFunctionElement(Parser::parseStringToRPN($input)));
            echo "Funktion gefunden: " . $funktion->ausgeben();
            $funktion->vereinfachen();
            echo "Vereinfacht:" . $funktion->ausgeben();
            echo "Abgelitten:" . $funktion->ableiten()->ausgeben();
            echo "Abgelitten & Vereinfacht:" . $funktion->ableiten()->vereinfachen()->ausgeben();


            $ausgabe = "Ausgabe: noch nichts";

            echo "<math>  <mpadded>
                $ausgabe
           </mpadded> </math> <br>";
        }
        ?>
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