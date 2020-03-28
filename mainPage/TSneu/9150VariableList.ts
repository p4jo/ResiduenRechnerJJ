function VariableListHTM () {

    HTMLoutput += "<form onsubmit='{event.preventDefault(); reloadSecondArea();}'><fieldset>";

    for (let index in registeredVariables) {
        let variable : Variable = registeredVariables[index];

        let valN = variable.inner;
        let mathOutput = '\\textrm{(nicht gesetzt)}';
        let output = '';
        if(valN != null) {
            mathOutput = valN.display();
            output = valN.displayInline();
        }

        let temp = variable.useinner ? "checked='checked'" : '';
        HTMLoutput += 
        `\\( ${variable.display()} = ${mathOutput} \\).  
        <label> Setze eigenen Wert: 
            <input class='II' type='text' id='input_${variable.name}' value='${output}' size='20'>. 
        </label> 
        <label>Direkt einsetzen:  
            <input class='II' type='checkbox' id='check_${variable.name}' ${temp} ">
        </label><br>`;


    }


    HTMLoutput +=  `</fieldset> <br> <Button type = 'submit'> Aktualisieren </Button> </form>`;
}


function updateVariables() {
    for (var key in registeredVariables) {
        let variable: Variable = registeredVariables[key];
        //Aktualisieren, wenn geändert
        if (formData["input_" + variable.name] != null &&
            formData["input_" + variable.name] != ((variable.inner != null) ? variable.inner.displayInline() : '')) {
            variable.inner = Parser.parseStringToFunktionElement(formData["input_" + variable.name]);
        }
        variable.useinner = ("check_" + variable.name in formData) && formData["check_" + variable.name];
        // alert(`${variable.name} : useinner: ${variable.useinner}, useInner(): ${variable.useInner()}`);
        //if (variable.useInner())
            //Debug
           // HTMLoutput += "Eingesetzter Wert \\(" + variable.inner.display() + "\\) für Variable " + variable.name + "<br>";
    }
}