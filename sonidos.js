var sonidos = new Object();
sonidos.pong = new Audio('pong.ogg');
sonidos.pong.volume = 0.8;
sonidos.pong2 = new Audio('pong2.ogg');
sonidos.pong2.volume = 0.5;
sonidos.entrada = new Audio('entrada.ogg');
sonidos.entrada.volume = 0.5;
sonidos.claxon = new Audio('claxon.ogg');
sonidos.claxon.volume = 0.2;
sonidos.cambio = new Audio('cambioOrbita.ogg');
sonidos.cambio.volume = 0.2;
sonidos.muerte = new Audio('muerte.ogg');
sonidos.muerte.volume = 0.5;

sonidos.fondo = new Audio('fondo.ogg');
sonidos.fondo.volume = 0.1;
sonidos.fondo.loop = true;
sonidos.fondo.play();
