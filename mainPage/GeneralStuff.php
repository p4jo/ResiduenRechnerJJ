<?php
require_once "Classes.php";

class EntireFunktion {
    //Hier ist das Wurzelelement gemeint, nicht die mathematische Wurzel
    private $root;
    public $currentVariableName = 'x';

    public function __construct(FunktionElement $root){
        $this->root = $root;
    }


    public function ausgeben() {
        return "<math>
									<mpadded>
										<mstyle mathsize=\"2em\" mathvariant=\"bold\">" .
            $this->root->ausgeben() .
            "</mstyle>
									</mpadded>
								</math> <br><br>";
    }

    public function simplifyNoConstVar() {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        $this->root = $this->root->simplify(null);
        return $this;
    }

    public function simplifyConstVar() {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        $this->root = $this->root->simplify(Variable::ofName($this->currentVariableName));
        return $this;
    }

    public function ableiten() {
        return new EntireFunktion($this->root->ableiten($this->currentVariableName));
    }

}