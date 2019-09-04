<?php
require_once "Classes.php";

class kompletteFunktion {
    //Hier ist das Wurzelelement gemeint, nicht die mathematische Wurzel
    private $wurzel;
    public $currentVariableName = 'x';

    public function __construct(FunktionElement $wurzel){
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
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        $this->wurzel = $this->wurzel->vereinfachen(Variable::ofName($this->currentVariableName));
        return $this;
    }

    public function ableiten() {
        return new kompletteFunktion($this->wurzel->ableiten($this->currentVariableName));
    }

}