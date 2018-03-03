/**
 * @param {[Jugador]} jugadores
 * @param {String} modo
 * @param {int} maxPlanetas
 * @param {int} bolasExtra
 * @param {Number} tiempo
 * @param {int} maxAgujeros
 * @param {Boolean} agujerosInofensivos
 * @param {int} [bolasXjugador]
 * @constructor
 */
function Game(jugadores, modo, maxPlanetas, bolasExtra, tiempo, maxAgujeros, agujerosInofensivos, bolasXjugador) {
    // Configuración del juego
    this.modo = (modo!==undefined && globf_esModo(modo))?modo:MODOS.CLASICO;
    this.maxPlanetas = (maxPlanetas>0)?maxPlanetas:jugadores.length+bolasExtra;
    this.numBolasExtra = bolasExtra;
    this.bolasXjugador = (bolasXjugador&&bolasXjugador>0)?bolasXjugador:1;
    this.maxAgujeros = maxAgujeros>0?maxAgujeros:0;
    this.duracion = tiempo;
    this.agujerosInofensivos = agujerosInofensivos;
    /**
     * @type {Jugador[]}
     */
    this.jugadores = jugadores;

    // Objetos de juego
    /**
     * @type {[Bola]}
     */
    this.bolas = [];

    /**
     * @type {[Agujero]}
     */
    this.agujeros = [];
    /**
     * @type {[Planeta]}
     */
    this.planetas = [];
    /**
     * @type {[Planeta]}
     */
    this.planetasND = [];
    /**
     * @type {[Planeta]}
     */
    this.planetasRV = [];
    /**
     * @type {[Asteroide]}
     */
    this.asteroides = [];

    // Funcionamiento
    this.mapaGenerado = false;
    this.bolasGeneradas = false;
    this.iniciado = false;
    this.pausado = false;
    this.finalizado = true;
    this.inicioPartida=0; // Guarda el momento de inicio de la partida
    this.then=0; // Para calcular el tiempo entre frames
}

/**
 * Inicia el juego
 */
Game.prototype.start = function() {
    this.generarMapa();
    this.generarBolas();
    generarPreRenderizados(juego);
    this.iniciado = true;
    this.finalizado = false;
    this.then = Date.now();
    this.inicioPartida = this.then;
    // Iniciamos el juego
    this.mainLoop();
};

/**
 * Bucle principal del juego
 */
Game.prototype.mainLoop = function() {
    var now = Date.now();
    var delta = now - this.then;

    if(delta === 0) {
        delta = 1;
        console.log("delta=0\n");
    } else {
        glob_fps = Math.round(0.6 *glob_fps + 400/delta);
        glob_fps_min = (glob_fps<glob_fps_min?glob_fps:glob_fps_min);
    }

    if(!this.pausado) {
        this.update(delta / 1000);
        render(this);

        //Fin de partida en modo no clásico
        if (this.duracion > 0 &&
            this.modo !== MODOS.CLASICO &&
            now - this.inicioPartida > this.duracion * 60000) {
            this.finalizar(null);
        }
        // Eliminación de notas antiguas
        for (var i in Log.notas) {
            if (Log.notas[i].t < now) {
                Log.notas.splice(parseInt(i), 1);
            } else {
                break;
            }
        }
    }

    this.then = now;
    // Request to do this again ASAP
    var self = this;
    if(!this.finalizado)
        requestAnimationFrame(function(){self.mainLoop()});
};

/**
 * Produce la actualización del juego, es llamada una vez por frame
 * @param {Number} elapsedSeconds tiempo pasado desde el último frame
 */
Game.prototype.update = function(elapsedSeconds) {
    if(elapsedSeconds === 0) return; // No válido

    this.physicsUpdate(elapsedSeconds);
    this.radioVariableUpdate();
    this.noDisponiblesUpdate();
};

/**
 * Actualiza la física de las bolas
 */
Game.prototype.physicsUpdate = function(elapsedSeconds) {
    // Actualizamos las colisiones de las que están orbitando,
    // planeta a planeta
    for(var i in this.planetas) {
        var planeta = this.planetas[i];
        planeta.bolasUpdate(elapsedSeconds);
    }

    // Actualizamos las colisiones de las bolas
    // que no se encuentran en ningún planeta
    for(i in this.bolas) {
        var bola = this.bolas[i];

        this.actualizacionAsteroides(bola, elapsedSeconds);

        if(bola.planeta || !bola.viva) continue;

        bola.anterior_pos = {x: bola.x, y: bola.y};
        this.bolaLibreUpdate(bola, elapsedSeconds);
        if(!bola.viva) {
            // Si se la ha tragado un agujero negro
            continue;
        }

        this.bolaColisionBordes(bola, elapsedSeconds);
        if(!bola.viva) {
            // Si ha caído fuera del campo
            continue;
        }

        this.orbitarPlanetaQuizas(bola);

        if(bola.planetaAnt) {
            if(moduloVector(bola.x - bola.planetaAnt.x, bola.y-bola.planetaAnt.y) > bola.planetaAnt.rg + RADIO_BOLAS)
                bola.planetaAnt = null; // Ya no cuenta el planeta anterior (puede volver a él)
        }
    }
};

/**
 * Comprueba si la bola ha colisionado con los bordes
 * y realiza las acciones correspondientes
 * @param {Bola} bola
 * @param {Number} elapsedSeconds segundos desde el último frame
 */
Game.prototype.bolaColisionBordes = function(bola, elapsedSeconds) {
    if(bola.x < 0 || bola.x > MAP.w) {
        bola.v.x *= -1;
        bola.x += bola.v.x * elapsedSeconds; // Previene que se atasque allí
        bola.planetaAnt = null; // Ya no cuenta el planeta anterior (puede volver a él)
        reproducir(sonidos.pong2);
        bola.damage(this, "Dead (out of bounds)");
    }
    if(bola.y < 0 || bola.y > MAP.h) {
        bola.v.y *= -1;
        bola.y += bola.v.y * elapsedSeconds; // Previene el atasco ahí
        bola.planetaAnt = null; // Ya no cuenta el planeta anterior (puede volver a él)
        reproducir(sonidos.pong2);
        bola.damage(this, "Dead (out of bounds)");
    }
};

/**
 * Comprueba si la bola está lo suficientemente cerca de un planeta como para orbitarlo,
 * si lo está y tiene que orbitarlo, la ancla al planeta.
 * @param {Bola} bola
 */
Game.prototype.orbitarPlanetaQuizas = function(bola) {
    var planet = this.planetaParaOrbitar(bola);
    //Cuando toca por primera vez una órbita
    if( (!bola.jugador || !keysDown[bola.jugador.controlId]) && planet && !bola.planeta) {
        bola.planeta = planet;
        planet.bolas.push(bola);
        // Vector u que va del planeta a la bola
        var ux = bola.x - planet.x;
        var uy = bola.y - planet.y;
        // El angulo es el agumento del vector u
        bola.ang = Math.atan2(uy, ux);
        // La velocidad angular tendrá como valor la velocidad lineal entre el radio
        bola.vR = Math.sqrt(bola.v.x*bola.v.x+bola.v.y*bola.v.y) / planet.rg;
        // El sigo será el de la componente en la tercera dimensión
        // de la multiplicación vectorial de u y la velocidad
        if(ux*bola.v.y-uy*bola.v.x < 0) bola.vR *= -1;
        //Sonido de entrar
        reproducir(sonidos.entrada);
    }
};

/**
 * Realiza algunas actualizaciones de los asteroides: recogida, actualización de habilidades, generación
 */
Game.prototype.actualizacionAsteroides = function(bola, elapsedSeconds) {
    for(var i in this.asteroides) {
        var as = this.asteroides[i];
        if( moduloVector(bola.x - as.x, bola.y - as.y) < bola.r + 5) {
            as.hacerEfecto(bola);
            this.asteroides.splice(parseInt(i), 1);
        }
    }
    if(bola.invencible)
    {
        bola.invencibleTime -=  elapsedSeconds * 1000;
        if(bola.invencibleTime < 0)
            bola.invencible = false;
    }
    if(bola.invisible)
    {
        bola.invisibleTime -= elapsedSeconds*1000;
        if(bola.invisibleTime < 0)
            bola.invisible = false;
    }
    if(bola.fortuna)
    {
        bola.fortunaTime -= elapsedSeconds*1000;
        if(bola.fortunaTime < 0)
            bola.fortuna = false;
    }
    if(bola.gravedad)
    {
        bola.gravedadTime -= elapsedSeconds*1000;
        if(bola.gravedadTime < 0)
            bola.gravedad = false;
    }

    if(Math.random() * 1000 < PROB_ASTEROIDE)
        this.asteroides.push(globf_generarAsteroide(this));
};

/**
 * Busca algún planeta cuya órbita esté en contacto con la última trayectoria
 * entre frames de la bola. Si no hay ninguno devuelve null.
 * @param {Bola} bola la bola que se ha desplazado
 */
Game.prototype.planetaParaOrbitar = function(bola) {
    for(var i in this.planetas) {
        var p = this.planetas[i];
        if ((p.nodisponible && !bola.gravedad) || bola.planetaAnt === p)
            continue;

        //Vamos a obtener la menor distancia del segmento (pl.anterior_pos pl.pos) al centro del Planeta
        var d = menorDistanciaPS(bola.anterior_pos, bola, p);
        if (d <= p.rg + RADIO_BOLAS && d >= p.rg - RADIO_BOLAS)
            return p;
    }
    return null;
};

/**
 * Actualiza una bola que ande libre por el espacio (sin planeta asociado)
 * @param bola
 * @param elapsedSeconds
 */
Game.prototype.bolaLibreUpdate = function(bola, elapsedSeconds) {
    bola.x += bola.v.x * elapsedSeconds;
    bola.y += bola.v.y * elapsedSeconds;

    if(!bola.noTragar) {
        // Comparamos su distancia con todos los agujeros negros existentes
        for(var i in this.agujeros) {
            var ag = this.agujeros[i];
            var d = menorDistanciaPS(bola.anterior_pos, bola, ag);
            // ag.r te atrae, ag.c te traga
            if(d <= ag.r) {
                if (!this.agujerosInofensivos && d <= ag.c) {
                    if (bola.transportado) {
                        // Si tiene el teletransporte la teletransportamos
                        bola.transportado = false;
                        var j;
                        do {
                            j = Math.floor(Math.random() * this.agujeros.length);
                        } while (this.agujeros.length > 1 && j === i);
                        bola.x = this.agujeros[j].x;
                        bola.y = this.agujeros[j].y;
                        bola.noTragar = this.agujeros[j];
                        bola.planetaAnt = null; // Ya no cuenta el planeta anterior (puede volver a él)
                    } else {
                        // Si no lo tiene, la matamos
                        bola.damage(this, "Dead (black hole)", true);
                        return; // Siguiente bola, esta c'est fini.
                    }
                } else {
                    var v = {'x': (ag.x - bola.x), 'y': (ag.y - bola.y)};
                    v.x *= elapsedSeconds * ag.a / moduloVector(v.x, v.y);
                    v.y *= elapsedSeconds * ag.a / moduloVector(v.x, v.y);
                    bola.v.x += v.x;
                    bola.v.y += v.y;
                }
                // Ya coincidió con uno, no seguir buscando
                break;
            }
        }
    } else {
        ag = bola.noTragar;
        d = menorDistanciaPS(bola.anterior_pos, bola, ag);
        if(d > ag.r) {
            bola.noTragar = null;
        }
    }
};

/**
 * Realiza la actualización de los planetas de radio variable (una vez por frame)
 */
Game.prototype.radioVariableUpdate = function() {
    for(var i in this.planetasRV) {
        var plan = this.planetasRV[i];
        if(plan.crece)
            plan.rv += 0.001;
        else
            plan.rv -= 0.001;
        if(plan.rv <= 0.75) {
            plan.rv = 0.75;
            plan.crece = true;
        }
        if(plan.rv >= 1) {
            plan.rv = 1;
            plan.crece = false;
        }
        plan.rg = plan.rr * plan.rv;
    }
};

/**
 * Actualiza los planetas que habían sido desactivados (no disponibles), una vez por frame.
 * También tiene cierta probabilidad de desactivar una nueva órbita de forma aleatoria.
 */
Game.prototype.noDisponiblesUpdate = function() {
    if(Math.random() * 1000 < PROB_DESACTIVAR)
        this.desactivarOrbitaAleatoria();

    for(var i in this.planetasND) {
        this.planetasND[i].nodisponible -= 1; //Volverá a estar disponible tarde o temprano
        if(this.planetasND[i].nodisponible < 1) {
            this.planetasND[i].nodisponible = 0;
            this.planetasND.splice(parseInt(i), 0); // Lo eliminamos, ya está disponible de nuevo
        }
    }
};

/**
 * Desactiva la órbita de un planeta cualquiera que esté activo
 */
Game.prototype.desactivarOrbitaAleatoria = function() {
    var i = Math.floor(Math.random() * this.planetas.length);
    if(!this.planetas[i].nodisponible && !this.planetas[i].centro) {
        this.planetasND.push(this.planetas[i]);
        this.planetas[i].nodisponible = 500;
    }
};

/**
 * Finaliza el juego, según el modo de juego el resultado será distinto
 * @param {Jugador} superviviente el jugador que ha sobrevivido, si sólo ha sido uno
 */
Game.prototype.finalizar = function(superviviente) {
    Log.clear();
    switch(this.modo) {
        case MODOS.CLASICO:
            Log.nuevaNota("Winner: Player " + superviviente.id, superviviente);
            break;
        case MODOS.INSTINTO:
            var menor = 0;
            var empate = true;
            for(var i=0; i<this.jugadores.length; i++) {
                var jug = this.jugadores[i];
                var mins = Math.floor(jug.ultimaMuerte / 60000);
                var secs = Math.floor((jug.ultimaMuerte - mins*60000)/1000);
                var mils = Math.floor((jug.ultimaMuerte - mins*60000 - secs*1000));
                if(mils < 100) mils = "0"+mils.toString();
                if(mils < 10) mils = "00"+mils.toString();

                Log.nuevaNota(
                    "Player " + (jug.id) + ": " +
                    jug.muertes + " deaths. Last one ("+mins+"' "+secs+"\" "+mils+")", jug);
                if(empate && jug.muertes !== 0)
                    empate = false;
                if(jug.muertes < this.jugadores[menor].muertes ||
                    (jug.muertes === this.jugadores[menor].muertes &&
                        jug.ultimaMuerte > this.jugadores[menor].ultimaMuerte ))
                    menor = i;
            }
            if(!empate)
                Log.nuevaNota("Winner: Player " + this.jugadores[menor].id, this.jugadores[menor]);
            else
                Log.nuevaNota("Draw!");
            break;
        case 2:
            var mayor = 0;
            for(i=0; i < this.jugadores.length; i++) {
                jug = this.jugadores[i];
                var nota = "Player " + (jug.id) + ": " + Math.round(jug.tiempo*100)/100 + " seconds.";
                if(jug.ultimo)
                    nota += " (Last one)";
                Log.nuevaNota(nota, this.jugadores[i]);
                if(jug.tiempo > this.jugadores[mayor].tiempo ||
                    (jug.tiempo === this.jugadores[mayor].tiempo && jug.ultimo ))
                    mayor = i;
            }
            Log.nuevaNota("Winner: Player " + this.jugadores[mayor].id, this.jugadores[mayor]);
            break;
    }
    var self = this;
    setTimeout(function() {
        self.finalizado = true;
        reproducir(sonidos.claxon);
    }, 100);
};

/**
 * Genera el mapa de juego, se llama automáticamente al iniciar el juego
 */
Game.prototype.generarMapa = function() {
    if(this.mapaGenerado) return; // No generar dos veces
    this.mapaGenerado = true;

    // En el modo centro hay un Planeta central extra
    if(this.modo === MODOS.CENTRO) {
        this.planetas.push(
            new Planeta(MAP.w / 2, MAP.h / 2,
                RADIO_PLANETA_CENTRO, RADIO_PLANETA_CENTRO*2, true));
    }

    //Generar planetas y agujeros
    for(var i=0; i < this.maxPlanetas; i++) {
        var nuevoPlaneta = globf_generarPlanetaRandom(
            RADIO_PLANETAS_MIN, RADIO_PLANETAS_MAX, this);
        if (!nuevoPlaneta)
            break;
        this.planetas.push(nuevoPlaneta);
        if(nuevoPlaneta.radioVariable) {
            this.planetasRV.push(nuevoPlaneta);
        }
    }

    for(i=0; i < this.maxAgujeros; i++) {
        var nuevoAgujero = globf_generarAgujeroRandom(
            CENTRO_AGUJERO_NEGRO,RADIO_AGUJERO_MIN,RADIO_AGUJERO_MAX,this);
        if (!nuevoAgujero)
            break;
        this.agujeros.push(nuevoAgujero);
    }
};

/**
 * Genera las bolas del juego para poder iniciarlo
 */
Game.prototype.generarBolas = function() {
    if(this.bolasGeneradas) return; // No generar dos veces
    this.bolasGeneradas = true;

    // Hacemos una copia de la lista de planetas, eliminamos el central
    var planetasDisponibles = this.planetas.slice(0);
    if(this.modo === MODOS.CENTRO) {
        for(var i in planetasDisponibles)
            if(planetasDisponibles.hasOwnProperty(i) && planetasDisponibles[i].centro) {
                planetasDisponibles.splice(parseInt(i), 1);
                break;
            }
    }

    // Generamos bolas de los jugadores
    var jugador;
    for(var idxJugador in this.jugadores) {
        if(this.jugadores.hasOwnProperty(idxJugador)) {
            jugador = this.jugadores[idxJugador];
            for(i=0; i < this.bolasXjugador; i++) {
                this.generarBola(jugador, planetasDisponibles);
            }
        }
    }

    // Generamos las bolas extra
    for(i=0; i < this.numBolasExtra; i++) {
        this.generarBola(null, planetasDisponibles);
    }
};

/**
 * Genera una única bola y la asigna a un planeta y al Jugador indicado
 * @param {Jugador} jugador Jugador al que asignar la bola, puede ser null si se desea que sea libre
 * @param {Array} planetasDisponibles Lista de planetas todavía disponibles
 */
Game.prototype.generarBola = function(jugador, planetasDisponibles) {
    var nuevaBola = new Bola("white", jugador);

    // Si hay planetas disponibles elegimos el siguiente disponible,
    // si no lo hay, escogemos uno aleatorio
    var pI;
    if(planetasDisponibles.length > 0) {
        pI = Math.floor(Math.random() * planetasDisponibles.length);
        nuevaBola.planeta = planetasDisponibles[ pI ];
        planetasDisponibles.splice(pI, 1);
    }else{
        pI = Math.floor(Math.random() * this.planetas.length);
        nuevaBola.planeta = this.planetas[ pI ];
    }
    nuevaBola.planeta.bolas.push(nuevaBola);

    // Velocidad y angulo
    var sig = Math.pow(-1, Math.round(Math.random())); //Para el signo
    nuevaBola.vR = sig * (3*Math.PI/4 + Math.PI/2 * Math.random());
    nuevaBola.vRPrevia = nuevaBola.vR;
    nuevaBola.ang = Math.random() * 10;

    // La guardamos
    this.bolas.push(nuevaBola);
};

/**
 * Lo llama el input para avisar de que el jugador para el keyCode indicado
 * puede repetir ya los sonidos
 * @param keyCode
 */
Game.prototype.puedeRepetirSonidos = function(keyCode) {
    for(var i in this.jugadores) {
        if(this.jugadores[i].secondControlId === keyCode
            || this.jugadores[i].controlId === keyCode) {
            this.jugadores[i].noRepetirSonidos = {};
        }
    }
};