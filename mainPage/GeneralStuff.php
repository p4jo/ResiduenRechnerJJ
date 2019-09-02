<?php
require_once "Classes.php";

class Checker {
    public function istQuadratisch(FunctionElement $e){
        return "NICHTS";
    }

}



class kompletteFunktion {
    //Hier ist das Wurzelelement gemeint, nicht die mathematische Wurzel
    private  $wurzel;

    public function __construct(FunctionElement $wurzel){
        $this->wurzel = $wurzel;
    }


    public function ausgeben() {
        return "<math>
									<mpadded>
										<mstyle mathsize=\"2em\" mathvariant=\"bold\">" .
            $this->wurzel->ausgeben() .
            "</mstyle>
									</mpadded>
								</math> <br><br>";
    }

    public function vereinfachen() {
        $this->wurzel = $this->wurzel->vereinfachen();
        return $this;
    }

    public function ableiten() {
        return new kompletteFunktion($this->wurzel->ableiten());
    }

}