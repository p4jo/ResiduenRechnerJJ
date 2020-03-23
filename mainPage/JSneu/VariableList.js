

//LOAD FROM SESSION VARIABLES
static var registeredVariables;
static var commaIsDecimalPoint = true;



function machtIrgendwas() {
    registeredVariables.foreach(wasAnderes);
}


function wasAnderes(item, index) {
    var valN = item.getInner();
    var mathOutput = '\textrm{(nicht gesetzt)}';
    var output = '';
    if(valN instanceof FunktionElement) {
        mathOutput = valN.ausgeben();
        output = valN.inlineAusgeben();
    }

    //To-DO
    //durch den ajax tunnel geschickt werden
    /*echo "\\( $variable->name = $mathOutput \\)  
    <label> Setzte eigenen Wert: 
        <input class='II' type='text' id='input_$variable->name' value='$output' size='20'>. 
    </label> 
    <label>Direkt einsetzen:  
        <input class='II' type='checkbox' id='check_$variable->name' ". ($variable->useInner() ? "checked='checked'" : '') .">
    </label>
        <br>";*/
}
