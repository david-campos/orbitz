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
    // Iniciar menú
    initMenu();
    // Ajustar canvas
    redimensionar(window.innerWidth, window.innerHeight);
};

// Función llamada cuando la resolución
// es demasiado baja
function resolucionInsuficiente(activo) {
    if(!juego) return;

    if(juego.iniciado && !juego.pausado) {
        document.getElementById("overscreen").innerHTML =
            "Resolución insuficiente, la resolución mínima es " + MIN_W + "x" + MIN_H + ".";
    }
    if(juego.iniciado) {
        document.getElementById("overscreen").innerHTML = "";
    }
    juego.pausado = activo;
}

/**
 * Muestra e inicia el juego
 * @param {[Jugador]} jugadores jugadores para el juego
 * @param {String} modo modo de juego, ver MODOS
 * @param {Number} tiempo minutos de juego (-1 para infinito)
 * @param {int} maxAgujeros número máximo de agujeros
 * @param {boolean} agujerosInofensivos si true, los agujeros no matarán al jugador
 */
function iniciar(jugadores, modo, tiempo, maxAgujeros, agujerosInofensivos) {
    document.getElementById("juego").style.display = "block";
    var maxPlanetas = 20 - maxAgujeros;
    var bolasExtra = Math.round(Math.random() * 5) + 5;
    juego = new Game(jugadores, modo, maxPlanetas, bolasExtra, tiempo, maxAgujeros, agujerosInofensivos);
    sonidoMenu.pause();
    sonidos.fondo.play();
    juego.start();
}