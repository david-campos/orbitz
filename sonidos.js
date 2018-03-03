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

var fondos = [
    new Audio('snd/Jay_Krewel_Break_The_Rules.mp3'),
    new Audio('snd/Space And Time.mp3'),
    new Audio('snd/Zythian_Bring_It_Back.mp3')
];
sonidos.cambiarFondo = function() {
    sonidos.fondo = fondos[Math.floor(Math.random() * fondos.length)];
    sonidos.fondo.currentTime = 0;
};
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