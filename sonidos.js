var sonidos = {};
var a = new Audio();
var extension = '.ogg';
if(!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''))) {
    // Si no obtenemos al menos un maybe, cargamos mp3
    extension = '.mp3';
}
sonidos.pong = new Audio('snd/pong' + extension);
sonidos.pong.volume = 1;
sonidos.pong2 = new Audio('snd/pong2' + extension);
sonidos.pong2.volume = 0.9;
sonidos.entrada = new Audio('snd/entrada' + extension);
sonidos.entrada.volume = 0.9;
sonidos.claxon = new Audio('snd/claxon' + extension);
sonidos.claxon.volume = 0.7;
sonidos.cambio = new Audio('snd/cambioOrbita' + extension);
sonidos.cambio.volume = 0.6;
sonidos.muerte = new Audio('snd/muerte' + extension);
sonidos.muerte.volume = 0.9;
sonidos.cinta = new Audio('snd/cinta' + extension);
sonidos.cinta.volume = 0.8;
sonidos.golpe = new Audio('snd/golpe' + extension);
sonidos.golpe.volume = 0.8;
sonidos.dados = new Audio('snd/dados' + extension);
sonidos.dados.volume = 0.8;
sonidos.pasarBoton = new Audio('snd/pasarBoton' + extension);
sonidos.pasarBoton.volume = 0.2;
sonidos.clickBoton = new Audio('snd/clickBoton.ogg');
sonidos.clickBoton.volume = 0.3;

sonidos.finalizado = new Audio('snd/beat_culture_julien' + extension);
sonidos.finalizado.volume = 0.3;

/**
 * @type {[Audio]}
 */
var fondos = [
    new Audio('snd/Jay_Krewel_Break_The_Rules' + extension),
    new Audio('snd/Space And Time' + extension),
    new Audio('snd/Zythian_Bring_It_Back' + extension)
];
sonidos.cambiarFondo = function() {
    sonidos.fondo = fondos[Math.floor(Math.random() * fondos.length)];
    sonidos.fondo.currentTime = 0;
    sonidos.fondo.volume = 0.3;
    sonidos.fondo.loop = true;
};
sonidos.cambiarFondo();

/**
 * Reproduce el sonido indicado
 * @param {Audio} sonido
 */
function reproducir(sonido) {
    sonido.currentTime = 0;
    sonido.play();
}

var glob_muted = false;
function toggleMute() {
    glob_muted = !glob_muted;
    for(var key in sonidos) {
        sonidos[key].muted = glob_muted;
    }
    for(key in fondos) {
        fondos[key].muted = glob_muted;
    }
    sonidoMenu.muted = glob_muted;

    // Menú
    if(muteBtn) {
        muteBtn.innerHTML = (glob_muted?"🔈":"🔊");
    }
}
