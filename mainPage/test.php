
<?php

require_once "Parser.php";
require_once "Classes.php";
require_once "EntireFunktion.php";
require_once "ExplicitOperations.php";

echo ((new EntireFunktion(new RationalNumber(2,5,7,9))) -> ausgeben());
echo Numeric::zero()->ausgeben();

?>
<math>
    <mstyle mathsize="1em">
        f() =
        <mfrac> <mn> 2 </mn> <mn> 5 </mn></mfrac>
        [ + <mfrac> <mn> 7 </mn> <mn> 9  </mfrac>i]</m></mstyle></math>