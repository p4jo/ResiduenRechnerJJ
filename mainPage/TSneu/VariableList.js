function VariableList() {
    HTMLoutput += "<form onsubmit='{event.preventDefault(); reloadSecondArea();}'><fieldset>";
    for (let index in registeredVariables) {
        let variable = registeredVariables[index];
        let valN = variable.inner;
        let mathOutput = '\\textrm{(nicht gesetzt)}';
        let output = '';
        if (valN instanceof FunktionElement) {
            mathOutput = valN.display();
            output = valN.displayInline();
        }
        let temp = variable.useInner() ? "checked='checked'" : '';
        HTMLoutput +=
            `\\( ${variable.name} = ${mathOutput} \\).  
<label> Setze eigenen Wert: 
    <input class='II' type='text' id='input_${variable.name}' value='${output}' size='20'>. 
</label> 
<label>Direkt einsetzen:  
    <input class='II' type='checkbox' id='check_${variable.name}' ${temp} ">
</label><br>
    `;
    }
    HTMLoutput +=
        `</fieldset> <br> <Button type = 'submit'> Aktualisieren </Button> </form>
`;
}
