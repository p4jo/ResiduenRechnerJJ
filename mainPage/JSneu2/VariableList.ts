

HTMLoutput += "<form><fieldset>";

for (var variable:Variable in registeredVariables) {
    var valN = variable.inner;
    var mathOutput = '\textrm{(nicht gesetzt)}';
    output = '';
    if(valN instanceof FunktionElement) {
        mathOutput = valN.ausgeben();
        output = valN.inlineAusgeben();
    }
    /*
    result += "<a> <math> <mi> variable.name </mi> = ". valN.ausgeben() ."</math>. Setzte eigenen Wert: <a>
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
}`
/*
result += "</fieldset>Ausdrücke können hier unten eigegeben werden.<fieldset>";

foreach (namedFunktionElements as name : funkEl) {
    valN = funkEl;
    mathOutput = '(nicht gesetzt)';
    output = '';
    if(valN instanceof FunktionElement) {
        mathOutput = valN.ausgeben();
        output = valN.inlineAusgeben();
    }
    /*
    result += "<a> <math> <mi> variable.name </mi> = ". valN.ausgeben() ."</math>. Setzte eigenen Wert: <a>
        <input class='II' type='text' id='input_variable.name' value='reF' size='8'> <a> + </a>
        <input class='II' type='text' id='input_variable.name' value='imF' size='8'> <a>i. Direkt einsetzen: </a>
        <input class='II' type='checkbox' id='check_variable.name'> <br>
        ";

    result += "<math> <mi> name </mi> <mo>=</mo> mathOutput </math>
    <label> Setzte eigenen Wert: 
        <input class='II' type='text' id='input_name' value='output' size='30'>. 
    </label> 
        <br>";
}
*/

    HTMLoutput +=
`</fieldset></form>
    <Button onclick=\"reloadSecondArea()\"> Aktualisieren </Button>
`;

}