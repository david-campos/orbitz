requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;

window.onload = function() {
    imgAgujero.src = "img/Agujero.png";
    canvas = document.getElementById("mainframe");
    ctx = canvas.getContext("2d");

    redimensionar(window.innerWidth, window.innerHeight);
};

// Función llamada cuando la resolución
// es demasiado baja
function resolucionInsuficiente(activo) {
    if(!juego) return;

    if(juego.iniciado && !juego.pausado) {
        document.getElementById("juego").style.display = "none";
        document.getElementById("resIns").style.display = "block";
        document.getElementById("resIns").innerHTML =
            "Resolución insuficiente, la resolución mínima es " + MIN_W + "x" + MIN_H + ".";
    }
    if(juego.iniciado) {
        document.getElementById("juego").style.display = "block";
        document.getElementById("resIns").style.display = "none";
    }
    juego.pausado = activo;
}

function iniciar() {
    document.getElementById("inicio").style.display = "none";
    document.getElementById("juego").style.display = "block";
    juego = new Game(
        [
            new Jugador("#900", 32, 90), // Spacebar, Z
            new Jugador("#090", 13, 191) // Enter, Ç
        ],
        MODOS.CLASICO, 20, 2, -1, 5, false);
    juego.start();
}