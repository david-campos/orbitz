var sonidos = {};
sonidos.pong = new Audio('snd/pong.ogg');
sonidos.pong.volume = 1;
sonidos.pong2 = new Audio('snd/pong2.ogg');
sonidos.pong2.volume = 0.9;
sonidos.entrada = new Audio('snd/entrada.ogg');
sonidos.entrada.volume = 0.9;
sonidos.claxon = new Audio('snd/claxon.ogg');
sonidos.claxon.volume = 0.7;
sonidos.cambio = new Audio('snd/cambioOrbita.ogg');
sonidos.cambio.volume = 0.6;
sonidos.muerte = new Audio('snd/muerte.ogg');
sonidos.muerte.volume = 0.9;
sonidos.cinta = new Audio('snd/cinta.ogg');
sonidos.cinta.volume = 0.8;
sonidos.golpe = new Audio('snd/golpe.ogg');
sonidos.golpe.volume = 0.8;

sonidos.finalizado = new Audio('snd/beat_culture_julien.mp3');
sonidos.finalizado.volume = 0.3;

/**
 * @type {[Audio]}
 */
var fondos = [
    new Audio('snd/Jay_Krewel_Break_The_Rules.ogg'),
    new Audio('snd/Space And Time.mp3'),
    new Audio('snd/Zythian_Bring_It_Back.mp3')
];
sonidos.cambiarFondo = function() {
    sonidos.fondo = fondos[Math.floor(Math.random() * fondos.length)];
    sonidos.fondo.currentTime = 0;
};
sonidos.cambiarFondo();
sonidos.fondo.volume = 0.3;
sonidos.fondo.loop = true;

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