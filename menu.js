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

    const tablaJugadores = document.getElementById("tabla-jugadores");
    const textsTime = ['1 minute', '2 minutes', '5 minutes', 'Infinite time'];
    const valuesTime = [1, 2, 5, -1];

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

            time.innerText = textsTime[textsTime.length-1];
            time.setAttribute("data-time", (textsTime.length-1).toString());
            tiempo = valuesTime[textsTime.length-1];

            switch (this.getAttribute("data-modo")) {
                case "Clasico":
                    modo = MODOS.CLASICO;
                    break;
                case "Instinto":
                    modo = MODOS.INSTINTO;
                    break;
                case "Centro":
                    time.innerText = time.innerText = textsTime[0];
                    time.setAttribute("data-time", "0");
                    tiempo = valuesTime[0];
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
            var jug = document.getElementById('player_' + i);
            if(mostrarJugador && jug.style.opacity === "0") {
                jug.getElementsByTagName("rect")[0].style.fill = coloresDisponibles.shift();
                jug.style.opacity = "1";
            }
            if(!mostrarJugador && jug.style.opacity !== "0") {
                coloresDisponibles.push(jug.getElementsByTagName("rect")[0].style.fill);
                jug.style.opacity = "0";
            }
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
        let state = parseInt(time.getAttribute('data-time'));
        state = (state + 1) % (textsTime.length - (modo === MODOS.CENTRO?1:0));
        console.log("to", state);
        tiempo = valuesTime[state];
        time.setAttribute('data-time', state.toString());
        time.innerHTML = textsTime[state];
    };

    muteBtn.onclick = function () {
        toggleMute(); // sonidos.js
    };

    var coloresDisponibles = [
        "#7400a0",
        "#009999",
        "#ff0094",
        "#C15616",
        "#000099",
        "#990000",
        "#009900",
        "#bbbb00"
    ];
    const rectsJugadores = tablaJugadores.getElementsByTagName("rect");
    Array.prototype.filter.call(rectsJugadores, function(rect){
        if(rect.parentElement.parentElement.parentElement.style.opacity !== "0") {
            var idx = Math.floor(Math.random() * coloresDisponibles.length);
            rect.style.fill = coloresDisponibles.splice(idx, 1)[0];
            rect.onclick = function () {
                coloresDisponibles.push(rect.style.fill); // Lo introducimos de último
                this.style.fill = coloresDisponibles.shift(); // Y cogemos el primero
            };
        }
    });

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