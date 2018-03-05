requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;

var glob_overscreen = null;

window.onload = function() {
    imgAgujero.ready = false;
    imgAgujero.src = "img/agujero.png";
    imgAgujero.onload = function() {
        this.ready = true;
    }
    iconos_asteroides.invencible.src = "img/ico_escudo.png";
    iconos_asteroides.invisible.src = "img/ico_ojo.png";
    iconos_asteroides.fortuna.src = "img/ico_trebol.png";
    iconos_asteroides.gravedad.src = "img/ico_ancla.png";
    iconos_asteroides.salvador.src = "img/ico_corazon.png";
    iconos_asteroides.transporte.src = "img/ico_rayo.png";
    iconos_asteroides.planetLover.src = "img/ico_gravedad.png";
    canvas = document.getElementById("mainframe");
    ctx = canvas.getContext("2d");
    secondCanvas = document.getElementById("backframe");
    scdCtx = secondCanvas.getContext("2d");
    glob_overscreen = document.getElementById("overscreen");
    // Iniciar menú
    initMenu();
    // Ajustar canvas
    redimensionar(window.innerWidth, window.innerHeight);
};

// Función llamada cuando la resolución
// es demasiado baja
function resolucionInsuficiente(activo) {
    if(!juego) return;

    if(juego.iniciado && !juego.finalizado && !juego.pausado && activo) {
        glob_overscreen.innerHTML =
            "Too low resolution, the minimum resolution is " + MIN_W + "x" + MIN_H + ".";
        glob_overscreen.style.backgroundColor = "black";
    }
    if(juego.iniciado && !juego.finalizado && juego.pausado && !activo) {
        glob_overscreen.innerHTML = "";
        glob_overscreen.style.backgroundColor = "";
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
    glob_overscreen.style.backgroundColor = "black";
    document.getElementById("menu").style.display = "none";
    document.getElementById("juego").style.display = "block";
    document.documentElement.style.animation = "unset";
    var maxPlanetas = 20 + Math.round(Math.random() * 5) - maxAgujeros;
    var bolasExtra = Math.round(Math.random() * 5) + 5;
    juego = new Game(jugadores, modo, maxPlanetas, bolasExtra, tiempo, maxAgujeros, agujerosInofensivos);
    sonidoMenu.pause();
    sonidos.golpe.play();
    setTimeout(elToquecito, 1000);
    juego.start();
}

function elToquecito() {
    sonidos.fondo.play();
    glob_overscreen.style.backgroundColor = "";
}

function restart() {
    // Cerramos menu restart
    glob_overscreen.innerHTML = "";
    sonidos.fondo.pause();
    sonidos.finalizado.pause();
    juego.apagar();

    // Recreamos jugadores y juego
    glob_overscreen.style.backgroundColor = "black";
    sonidos.cambiarFondo();

    var jugadores = [];
    for(var idx in juego.jugadores) {
        var jugador = juego.jugadores[idx];
        jugadores.push(new Jugador(jugador.color, jugador.controlId, jugador.secondControlId));
    }
    juego = new Game(jugadores, juego.modo, juego.maxPlanetas, juego.numBolasExtra, juego.duracion,
        juego.maxAgujeros, juego.agujerosInofensivos, juego.bolasXjugador);
    sonidos.golpe.play();
    setTimeout(elToquecito, 1000);
    juego.start();

}

function mainMenu() {
    // Cerramos menu restart
    glob_overscreen.innerHTML = "";
    sonidos.finalizado.pause();
    juego.apagar();

    //glob_overscreen.style.backgroundColor = "black";

    document.getElementById("menu").style.display = "";
    document.getElementById("juego").style.display = "none";
    document.documentElement.style.animation = "";

    sonidoMenu.play();
}
