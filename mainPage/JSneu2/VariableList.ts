function VariableList () {

    HTMLoutput += "<form><fieldset>";

    var variable : any;
    for (variable in registeredVariables) {
        var valN = variable.inner;
        var mathOutput = '\textrm{(nicht gesetzt)}';
        let output = '';
        if(valN instanceof FunktionElement) {
            mathOutput = valN.ausgeben();
            output = valN.inlineAusgeben();
        }
        /*
        HTMLoutput += "<a> <math> <mi> variable.name </mi> = ". valN.ausgeben() ."</math>. Setzte eigenen Wert: <a>
            <input class='II' type='text' id='input_variable.name' value='reF' size='8'> <a> + </a>
            <input class='II' type='text' id='input_variable.name' value='imF' size='8'> <a>i. Direkt einsetzen: </a>
            <input class='II' type='checkbox' id='check_variable.name'> <br>
            ";
        */
        HTMLoutput += 
`\\( variable.name = mathOutput \\)  
<label> Setzte eigenen Wert: 
    <input class='II' type='text' id='input_variable.name' value='output' size='20'>. 
</label> 
<label>Direkt einsetzen:  
    <input class='II' type='checkbox' id='check_variable.name' ". (variable.useInner() ? "checked='checked'" : '') .">
</label>
    <br>";
}`;

    }

    HTMLoutput +=
`</fieldset></form>
    <Button onclick=\"reloadSecondArea()\"> Aktualisieren </Button>
`;
}