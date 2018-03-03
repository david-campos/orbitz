requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;

window.onload = function() {
    imgAgujero.src = "img/Agujero.png";
    iconos_asteroides.invencible.src = "img/ico_escudo.png";
    iconos_asteroides.invisible.src = "img/ico_ojo.png";
    iconos_asteroides.fortuna.src = "img/ico_trebol.png";
    iconos_asteroides.gravedad.src = "img/ico_ancla.png";
    iconos_asteroides.salvador.src = "img/ico_corazon.png";
    iconos_asteroides.transporte.src = "img/ico_rayo.png";
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
        MODOS.CENTRO, 20, 2, 10, 5, false);
    juego.start();
}