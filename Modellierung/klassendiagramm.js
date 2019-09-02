/*function zeichnen() {
    var element = document.getElementById('zeichnen');

    if (element.getContext) {
        var context = element.getContext('2d');
        context.beginPath();
        canvas_arrow(context, 90, 90, 30, 30);
        context.stroke();

    }
}


function canvas_arrow(context, fromx, fromy, tox, toy) {
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}*/



function breiteUndHoehe() {
    alert("Die aktuelle Fenstergröße\n Breite: " + document.body.offsetWidth + "  Höhe: " + document.body.offsetHeight + " Pixel");
}

function breite() {
    return document.body.offsetWidth;
}

function setSize(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
}


var inReiheAbstand = 10;
var zeilenAbstand = 70;
var size = 15;
function zeichnen() {
    var klassen = [];
    var beziehungen = [];

    klassenFuellen(klassen);
    beziehungenFuellen(beziehungen);


    var canvas = document.getElementById('zeichnen');
    setSize(canvas, gebeMaxBreite(canvas.getContext('2d'), klassen) + 10, gebeMaxHoehe(klassen) + 10);

    var elemLeft = canvas.offsetLeft, elemTop = canvas.offsetTop;
    canvas.addEventListener('click', function (event) {
        var x = event.pageX - elemLeft,
            y = event.pageY - elemTop;

        // Collision detection between clicked offset and element.
        for (var i = 0; i < ankerPunkte.length; i++) {
            if (ankerPunkte[i].leftx < x && ankerPunkte[i].rightx > x && ankerPunkte[i].topy < y && ankerPunkte[i].lowy > y) {
                break;
            }
        }

        //alert("klicked: " + ankerPunkte[i].name);
        window.location = "http://www.residuenrechner.jgeigers.de/api/detail/index.php?name=" + ankerPunkte[i].name;


    }, false);

    
    //Zeichnen
    var context = canvas.getContext('2d');
    var rowCount = [0, 0, 0, 0, 0, 0, 0];
    var ankerPunkte = [];
    klassen.forEach(function (klasse) {
        //context.fillStyle = klasse.colour;
        var rowX = rowCount[klasse.reihe];
        var rowY = (klasse.reihe - 1) * zeilenAbstand;
        context.strokeStyle = 'black';
        context.font = size + "px Arial";
        context.textBaseline = 'top';
        context.fillText(klasse.name, rowX + klasse.left + klasse.rand, rowY + klasse.top + klasse.rand / 2);
        // Messen der Breite mit measureText(text).width
        var measure = context.measureText(klasse.name);
        var width = measure.width.toFixed(2);
        var height = size + klasse.rand;
        context.strokeRect(rowX + klasse.left, rowY + klasse.top, (parseInt(width, 10) + 2 * klasse.rand), height);
        ankerPunkte.push({
            name: klasse.name,
            reihe: klasse.reihe,
            x: rowX + klasse.left + (parseInt(width, 10) + 2 * klasse.rand) / 2,
            y: rowY + klasse.top + height / 2,
            topy: rowY + klasse.top,
            lowy: rowY + klasse.top + height,
            leftx: rowX + klasse.left,
            rightx: rowX + klasse.left + (parseInt(width, 10) + 2 * klasse.rand)
        });
        rowCount[klasse.reihe] += (parseInt(width, 10) + 2 * klasse.rand) + inReiheAbstand;
    });
    beziehungen.forEach(function (verbindung) {
        switch (verbindung.name) {
            case 'extends':
                var von = -1, nach = -1;
                for (var i = 0; i < ankerPunkte.length; i++) {
                    if (ankerPunkte[i].name == verbindung.von) {
                        von = i;
                    }
                    if (ankerPunkte[i].name == verbindung.nach) {
                        nach = i;
                    }
                }
                if (von != -1 && nach != -1) {
                    if (ankerPunkte[von].reihe > ankerPunkte[nach].reihe) {
                        pfeil(context, ankerPunkte[von].x, ankerPunkte[von].topy, ankerPunkte[nach].x, ankerPunkte[nach].lowy);
                    } else if (ankerPunkte[von].reihe < ankerPunkte[nach].reihe) {
                        pfeil(context, ankerPunkte[von].x, ankerPunkte[von].lowy, ankerPunkte[nach].x, ankerPunkte[nach].topy);
                    } else {
                        //muss noch implementiert werden.
                    }
                }
                break;
            case 'contains':
                var von, nach;
                for (var i = 0; i < ankerPunkte.length; i++) {
                    if (ankerPunkte[i].name == verbindung.von) {
                        von = i;
                    }
                    if (ankerPunkte[i].name == verbindung.nach) {
                        nach = i;
                    }
                }
                if (von != -1 && nach != -1) {
                    if (ankerPunkte[von].reihe > ankerPunkte[nach].reihe) {
                        pfeil_contains(context, ankerPunkte[von].x, ankerPunkte[von].topy, ankerPunkte[nach].x, ankerPunkte[nach].lowy);
                    } else if (ankerPunkte[von].reihe < ankerPunkte[nach].reihe) {
                        pfeil_contains(context, ankerPunkte[von].x, ankerPunkte[von].lowy, ankerPunkte[nach].x, ankerPunkte[nach].topy);
                    } else {
                        // TODO Collision-Detection
                        if (ankerPunkte[von].rightx < ankerPunkte[nach].leftx) {
                            pfeil_contains(context, ankerPunkte[von].rightx, ankerPunkte[von].y, ankerPunkte[nach].leftx, ankerPunkte[nach].y);
                        } else if (ankerPunkte[von].leftx > ankerPunkte[nach].rightx) {
                            pfeil_contains(context, ankerPunkte[von].leftx, ankerPunkte[von].y, ankerPunkte[nach].rightx, ankerPunkte[nach].y);
                        }
                    }
                }
                break;
        }
    });
}

function pfeil(context, x1, y1, x2, y2) {
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    /*var winkel = 15;
    var laenge = 20;
    var breite = laenge / 2;

    var neigung = Math.atan((Math.abs(y2 - y1)) / (Math.abs(x2 - x1)));
    //links oben
    if (0 <= neigung && neigung <= Math.PI/2) {
        context.moveTo(x1, y1);
        context.lineTo(x2 + Math.cos(neigung) * 10, y2 + Math.sin(neigung) * laenge);
    //rechts oben
    } else if (0 > neigung && neigung > -Math.PI/2) {
        context.moveTo(x1, y1);
        context.lineTo(x2 - Math.abs(Math.cos(neigung) * 10), y2 + Math.sin(neigung) * laenge);
    }*/
    context.stroke();
}

function pfeil_contains(context, fromx, fromy, tox, toy) {
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
}



function gebeMaxHoehe(klassen) {
    var max = 0;
    klassen.forEach(function (klasse) {
        var rowY = (klasse.reihe - 1) * zeilenAbstand;
        var height = size + klasse.rand;
        if(max < rowY + klasse.top + height) {
            max = rowY + klasse.top + height;
        }
    });
    return max;
}


function gebeMaxBreite(context, klassen) {
    var max = 0;
    var rowCount = [0, 0, 0, 0, 0, 0, 0];
    context.font = size + "px Arial";
    klassen.forEach(function (klasse) {
        var rowX = rowCount[klasse.reihe];
        var measure = context.measureText(klasse.name);
        var width = measure.width.toFixed(2);
        if(rowX + klasse.left + (parseInt(width, 10) + 2 * klasse.rand) > max) {
            max = rowX + klasse.left + (parseInt(width, 10) + 2 * klasse.rand);
        }
        rowCount[klasse.reihe] += (parseInt(width, 10) + 2 * klasse.rand) + inReiheAbstand;
    });
    return max;
}



function klassenFuellen(klassen) {
    klassen.push({
        name: 'Funktion',
        top: 10,
        left: 10,
        rand: 15,
        reihe: 1
    });

    klassen.push({
        name: 'Funktionselement',
        top: 10,
        left: 150,
        rand: 15,
        reihe: 1
    });

    klassen.push({
        name: 'Operation',
        top: 10,
        left: 100,
        rand: 15,
        reihe: 2
    });

    klassen.push({
        name: 'DoppelOperation',
        top: 10,
        left: 20,
        rand: 15,
        reihe: 3
    });

    klassen.push({
        name: 'EinzelOperation',
        top: 10,
        left: 100,
        rand: 15,
        reihe: 3
    });


    klassen.push({
        name: 'addition',
        top: 10,
        left: 0,
        rand: 15,
        reihe: 4
    });
    klassen.push({
        name: 'subtraktion',
        top: 10,
        left: 0,
        rand: 15,
        reihe: 4
    });
    klassen.push({
        name: 'multiplikation',
        top: 10,
        left: 0,
        rand: 15,
        reihe: 4
    });
    klassen.push({
        name: 'division',
        top: 10,
        left: 0,
        rand: 15,
        reihe: 4
    });
    klassen.push({
        name: 'potenz',
        top: 10,
        left: 0,
        rand: 15,
        reihe: 4
    });
    klassen.push({
        name: 'wurzel',
        top: 10,
        left: 0,
        rand: 15,
        reihe: 4
    });
    klassen.push({
        name: 'Numeric',
        top: 10,
        left: 0,
        rand: 15,
        reihe: 4
    });
    klassen.push({
        name: 'Constant',
        top: 10,
        left: 0,
        rand: 15,
        reihe: 4
    });
    klassen.push({
        name: 'Variable',
        top: 10,
        left: 0,
        rand: 15,
        reihe: 4
    });
}

function beziehungenFuellen(beziehungen) {
    beziehungen.push({
        name: 'contains',
        von: 'Funktion',
        nach: 'Funktionselement'
    });

    beziehungen.push({
        name: 'extends',
        von: 'Operation',
        nach: 'Funktionselement'
    });
    beziehungen.push({
        name: 'extends',
        von: 'DoppelOperation',
        nach: 'Operation'
    });
    beziehungen.push({
        name: 'extends',
        von: 'EinzelOperation',
        nach: 'Operation'
    });

    beziehungen.push({
        name: 'extends',
        von: 'addition',
        nach: 'DoppelOperation'
    });
    beziehungen.push({
        name: 'extends',
        von: 'subtraktion',
        nach: 'DoppelOperation'
    });
    beziehungen.push({
        name: 'extends',
        von: 'multiplikation',
        nach: 'DoppelOperation'
    });
    beziehungen.push({
        name: 'extends',
        von: 'division',
        nach: 'DoppelOperation'
    });
    beziehungen.push({
        name: 'extends',
        von: 'potenz',
        nach: 'DoppelOperation'
    });
    beziehungen.push({
        name: 'extends',
        von: 'wurzel',
        nach: 'EinzelOperation'
    });
}