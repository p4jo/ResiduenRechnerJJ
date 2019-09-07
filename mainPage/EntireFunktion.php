<?php

require_once "Classes.php";

class EntireFunktion
{
    //Hier ist das Wurzelelement gemeint, nicht die mathematische Wurzel
    private /*FunktionElement*/ $root;
    public /*string*/ $name;

    public function __construct(FunktionElement $root, string $name = 'f')
    {
        $this->root = $root;
        $this->name = $name;
    }


    public function ausgeben()
    {
        /*mathvariant=\"bold\"*/
        return "<math><mpadded><mstyle mathsize='1em'>" .
            $this->name . "(" . Variable::$workVariable . ") = " . $this->root->ausgeben() . "
            </mstyle></mpadded></math> <br>";
    }

    public function simplify()
    {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        return new self($this->root->simplify(), $this->name);
    }

    public function ableiten()
    {
        return new self($this->root->ableiten(), $this->name . "'");
    }
}