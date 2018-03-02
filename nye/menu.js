window.onload = function () {
    // Iniciar partida
    const addPlayer = document.getElementById('addPlayer');
    const removePlayer = document.getElementById('removePlayer');
    const blackholes = document.getElementById('blackholes');
    const harmless = document.getElementById('harmless');
    const initGame = document.getElementById('initGame');
    const time = document.getElementById('time');
    const mute = document.getElementById('mute');
    const sonido = document.getElementById('sonido');

    const modos = document.getElementById('modos');
    const interfaz = document.getElementById('interfaz');
    const creditos = document.getElementById('creditos');

    const goCredits = document.getElementById('goCredits');

    // Al hacer click en los botones iniciales, pasar a la siguiente pantalla
    const botones = document.getElementsByClassName('btn_start');
    Array.prototype.filter.call(botones, function (value) {
        value.onclick = function (ev) {
           modos.style.display = 'none';
            interfaz.style.display = 'block';
        }
    });

    const goBack = document.getElementsByClassName('goBack');
    Array.prototype.filter.call(goBack, function (value) {
        value.onclick = function (ev) {
            modos.style.display = 'block';
            interfaz.style.display = 'none';
            creditos.style.display = 'none';
        }
    });

    goCredits.onclick = function(ev) {
        modos.style.display = 'none';
        interfaz.style.display = 'none';
        creditos.style.display = 'block';
    };

    // Añadir jugador
    let jugadoresN = 2;
    addPlayer.onclick = function (ev) {
        if (jugadoresN < 4) {
            ++jugadoresN;
        }
        actualizar();
    };

    removePlayer.onclick = function (ev) {
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
            let mostrar = i <= jugadoresN;
            document.getElementById('player_' + i).style.opacity = (mostrar ? "1" : "0");
        }
    }

    blackholes.onchange = function (ev) {
        harmless.style.display = (this.checked ? 'inline-block' : 'none');
    };

    initGame.onclick = function () {
        alert("empiesa no mas");
    };

    let toggle = function (ev) {
        if (ev.classList.contains("active")) {
            ev.classList.remove("active");
        } else {
            ev.classList.add("active");
        }
    };

    blackholes.onclick = function (ev) {
        toggle(this);
        if (this.classList.contains("active")) {
            harmless.style.display = "inline-block";
        } else {
            harmless.style.display = "none";
        }
    };

    harmless.onclick = function (ev) {
        toggle(this);
    };

    time.onclick = function(ev) {
        const textsTime = ['Infinite time', '2 minutes', '5 minutes'];
        const valuesTime = [-1, 2, 5];

        let state = time.getAttribute('data-time');
        state = (state + 1) % textsTime.length;
        time.setAttribute('data-time', state);

        time.innerHTML = textsTime[state];
    };

    mute.onclick = function(ev) {
        let state = mute.getAttribute('data-sound');

        state = 1 - state;
        mute.setAttribute('data-sound', state);

        if (state === 1) {
            mute.innerHTML = "🔊";
            sonido.muted = false;
        } else {
            mute.innerHTML = "🔈";
            sonido.muted = true;
        }
    }
};