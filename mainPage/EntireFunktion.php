<?php
require_once "Classes.php";

class EntireFunktion {
    //Hier ist das Wurzelelement gemeint, nicht die mathematische Wurzel
    private $root;

    public function __construct(FunktionElement $root){
        $this->root = $root;
    }


    public function ausgeben() {
        /*mathvariant=\"bold\"*/
        return "<math><mpadded><mstyle mathsize='1em'>
            f(". Variable::$workVariable . ") = " . $this->root->ausgeben() . "
            </mstyle></mpadded></math> <br>";
    }

    public function simplify() {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        return new self($this->root->simplify());
    }

    public function ableiten() {
        return new self($this->root->ableiten());
    }

}