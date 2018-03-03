var sonidoMenu = null;
var muteBtn = null;

function initMenu() {
    const addPlayer = document.getElementById('addPlayer');
    const removePlayer = document.getElementById('removePlayer');
    const blackholes = document.getElementById('blackholes');
    const harmless = document.getElementById('harmless');
    const initGame = document.getElementById('initGame');
    const time = document.getElementById('time');
    muteBtn = document.getElementById('mute');

    const modos = document.getElementById('modos');
    const interfaz = document.getElementById('interfaz');
    const creditos = document.getElementById('creditos');

    const goCredits = document.getElementById('goCredits');
    sonidoMenu = document.getElementById('sonido');

    var jugadoresN = 2;
    var modo;
    var tiempo = -1;

    const todosBotones = document.getElementsByTagName("a");
    Array.prototype.filter.call(todosBotones, function (value) {
        value.onmouseenter = function () {
            if (muteBtn.getAttribute('data-sound') === "1") {
                const audio = new Audio('snd/pasarBoton.ogg');
                audio.volume = 0.2;
                audio.play();
            }
        };
        value.onmouseup = function (ev) {

            if (muteBtn.getAttribute('data-sound') === "1") {
                const audio = new Audio('snd/clickBoton.ogg');
                audio.volume = 0.3;
                audio.play();
            }
        }
    });


    // Al hacer click en los botones iniciales, pasar a la siguiente pantalla
    const botonesModoJuego = document.getElementsByClassName('btn_start');
    Array.prototype.filter.call(botonesModoJuego, function (value) {
        value.onclick = function () {
            modos.style.display = 'none';
            interfaz.style.display = 'block';

            time.innerText = "Infinite time";
            time.setAttribute("data-time", "0");

            switch (this.getAttribute("data-modo")) {
                case "Clasico":
                    modo = MODOS.CLASICO;
                    break;
                case "Instinto":
                    modo = MODOS.INSTINTO;
                    break;
                case "Centro":
                    time.innerText = "2 minutes";
                    time.setAttribute("data-time", "1");

                    modo = MODOS.CENTRO;
                    break;
            }
        }
    });

    const goBack = document.getElementsByClassName('goBack');
    Array.prototype.filter.call(goBack, function (value) {
        value.onclick = function () {
            modos.style.display = 'block';
            interfaz.style.display = 'none';
            creditos.style.display = 'none';
            goCredits.style.display = 'flex';
        }
    });

    goCredits.onclick = function () {
        modos.style.display = 'none';
        interfaz.style.display = 'none';
        goCredits.style.display = 'none';
        creditos.style.display = 'block';
    };

    // Añadir jugador
    addPlayer.onclick = function () {
        if (jugadoresN < 4) {
            ++jugadoresN;
        }
        actualizar();
    };

    removePlayer.onclick = function () {
        if (jugadoresN > 2) {
            --jugadoresN;
        }
        actualizar();
    };

    function actualizar() {
        if (jugadoresN === 4) {
            addPlayer.classList.add("disabled");
        } else {
            addPlayer.classList.remove("disabled");
        }

        if (jugadoresN === 2) {
            removePlayer.classList.add("disabled");
        } else {
            removePlayer.classList.remove("disabled");
        }
        for (let i = 1; i <= 4; ++i) {
            const mostrarJugador = i <= jugadoresN;
            document.getElementById('player_' + i).style.opacity = (mostrarJugador ? "1" : "0");
        }
    }

    blackholes.onchange = function () {
        harmless.style.display = (this.checked ? 'inline-block' : 'none');
    };

    let toggle = function (ev) {
        if (ev.classList.contains("active")) {
            ev.classList.remove("active");
        } else {
            ev.classList.add("active");
        }
    };

    blackholes.onclick = function () {
        toggle(this);
        if (this.classList.contains("active")) {
            harmless.style.display = "inline-block";
        } else {
            harmless.style.display = "none";
        }
    };

    harmless.onclick = function () {
        toggle(this);
    };

    time.onclick = function () {
        const textsTime = ['Infinite time', '2 minutes', '5 minutes'];
        const valuesTime = [-1, 2, 5];

        let state = time.getAttribute('data-time');
        state = (state + 1) % textsTime.length;

        if (modo === MODOS.CENTRO && state === 0) {
            ++state;
        }

        tiempo = valuesTime[state];

        time.setAttribute('data-time', state);

        time.innerHTML = textsTime[state];
    };

    muteBtn.onclick = function () {
        toggleMute(); // sonidos.js
    };

    // Empezar juego (ver main.js)
    initGame.onclick = function () {
        let maxAgujeros = Math.round(Math.random() * 4) + 2;
        if (!blackholes.classList.contains("active")) {
            maxAgujeros = 0;
        }

        let agujerosInofensivos = harmless.classList.contains("active");

        // Hay jugadoresN jugadores
        // Es mejor generar la lista de jugadores aquí,
        // por si lo hacemos configurable (colores, teclas) más tarde.
        const jugadores = [];
        for (let i = 1; i <= jugadoresN; i++) {
            const jugador = document.getElementById('player_' + i);
            const rects = jugador.getElementsByTagName("rect");
            if (rects.length > 0) {
                const color = rects[0].style.fill;
                const mainKey = jugador.getElementsByClassName("key")[0].getAttribute("data-keyCode");
                const secondKey = jugador.getElementsByClassName("key")[1].getAttribute("data-keyCode");
                jugadores.push(new Jugador(color, mainKey, secondKey));
            }
        }

        iniciar(jugadores, modo, tiempo, maxAgujeros, agujerosInofensivos);
    };
}