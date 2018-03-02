var sonidos = {};
sonidos.pong = new Audio('snd/pong.ogg');
sonidos.pong.volume = 0.8;
sonidos.pong2 = new Audio('snd/pong2.ogg');
sonidos.pong2.volume = 0.5;
sonidos.entrada = new Audio('snd/entrada.ogg');
sonidos.entrada.volume = 0.5;
sonidos.claxon = new Audio('snd/claxon.ogg');
sonidos.claxon.volume = 0.2;
sonidos.cambio = new Audio('snd/cambioOrbita.ogg');
sonidos.cambio.volume = 0.2;
sonidos.muerte = new Audio('snd/muerte.ogg');
sonidos.muerte.volume = 0.5;
sonidos.cinta = new Audio('snd/cinta.ogg');
sonidos.cinta.volume = 0.3;

sonidos.fondo = new Audio('snd/fondo.ogg');
sonidos.fondo.volume = 0.1;
sonidos.fondo.loop = true;

sonidos.fondo.play();

/**
 * Reproduce el sonido indicado
 * @param {Audio} sonido
 */
function reproducir(sonido) {
    sonido.currentTime = 0;
    sonido.play();
}