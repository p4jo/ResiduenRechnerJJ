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

    public function simplified()
    {
        //muss vielleicht so oft wiederholt werden, bis sich nichts mehr ändert
        return new self($this->root->simplified(), $this->name);
    }

    public function derivative()
    {
        return new self($this->root->derivative(), $this->name . "'");
    }
}