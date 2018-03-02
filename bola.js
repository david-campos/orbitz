/**
 * @param {String} color
 * @param {Jugador} jug
 * @constructor
 */
function Bola(color, jug) {
    this.v = {x: 0, y: 0};
    this.vR = Math.PI; //Velocidad angular en rad/s (solo efectiva dentro de orbita)
    this.vRPrevia = this.vR;
    this.maxV = 0.15; // Velocidad angular máxima
    this.incVr = Math.PI / 6; //Aumento de velocidad rad/(s^2)

    this.ang = 0; //Angulo girado.
    this.x = 0; // Posición en x
    this.y = 0; // Posición en y
    this.anterior_pos = {x:0, y:0};
    this.r = RADIO_BOLAS;

    /** @type {Planeta} */
    this.planeta = null; // Planeta asociado
    /** @type {Planeta} */
    this.planetaAnt = null; // Planeta previo

    /** @type {?Agujero} */
    this.noTragar = null; // La protege de ser tragada para cuando sale de un agujero negro (gracias al asteroide)
    this.gravedad = false; // Para el asteroide gravedad propia

    this.viva = true;
    this.maxvidas = 4;
    this.vidas = this.maxvidas;
    this.color = color;
    this.jugador = jug;
    if(this.jugador) {
        this.jugador.asignarBola(this);
    }
}

/**
 * Echa a la bola de la órbita en la que se encuentra
 */
Bola.prototype.salirOrb = function () {
    if (!this.planeta) return;
    // v será la velocidad lineal
    var v = this.vR * this.planeta.rg;
    // intercambiamos las componentes y negamos una para obtener u perpendicular al radio
    var u = {x:  this.planeta.y-this.y, y: this.x - this.planeta.x};
    // Hacemos u unitario
    var mu = moduloVector(u.x, u.y);
    u.x = u.x / mu;
    u.y = u.y / mu;
    this.v.x = u.x * v;
    this.v.y = u.y * v;
    this.planetaAnt = this.planeta;
    this.planeta.bolas.splice(this.planeta.bolas.indexOf(this), 1);
    this.planeta = null;
    reproducir(sonidos.cambio);
};

/**
 * Daña la bola y puede que termine el juego
 * @param {Game} juego Juego en el que está la bola
 * @param {String} mensajeEnCasoDeMuerte un mensaje en caso de que este daño produzca la muerte
 * @param {boolean} [mortal] si es true, la bola muere independientemente de sus vidas restantes
 */
Bola.prototype.damage = function (juego, mensajeEnCasoDeMuerte, mortal) {
    // Si no hay al menos dos bolas o el modo es "Centro", no muere nadie humano
    if (juego.bolas.length < 2 || (juego.modo === MODOS.CENTRO && this.jugador)) return;

    // Asteroide salvador
    if (this.salvado) {
        this.salvado = false;
        return;
    }

    // Restamos una vida
    this.vidas--;
    var c = Math.floor((this.vidas - 0.3) / (this.maxvidas - 0.3) * 255);
    this.color = "rgb(" + c + "," + c + "," + c + ")";

    // Continuar viviendo?
    if (!mortal && this.vidas > 0) {
        if (this.jugador)
            Log.nuevaNota(this.vidas + " vidas restantes", this.jugador);
        else
            Log.nuevaNota(this.vidas + " vidas restantes");
        this.planetaAnt = null;
        return;
    }

    // Ha muerto
    this.viva = false;
    sonidos.muerte.currentTime = 0;
    sonidos.muerte.play();

    //Si tiene Jugador lo administramos para buscarle otra a ser posible
    if (this.jugador) {
        Log.nuevaNota(mensajeEnCasoDeMuerte, this.jugador);
        this.jugador.bolas--;
        this.jugador.muertes++;
        this.jugador.ultimaMuerte = Date.now() - juego.inicioPartida;

        for (var i in juego.bolas) {
            if (!juego.bolas[i].jugador) {
                juego.bolas[i].jugador = this.jugador;
                this.jugador.bolas++;
                break;
            }
        }
        //Adiós Bola
        juego.bolas.splice(juego.bolas.indexOf(this), 1);
    } else {
        //Adiós Bola
        juego.bolas.splice(juego.bolas.indexOf(this), 1);
        return; //La muerte de una Bola sin Jugador no puede causar el final.
    }

    // Comprobamos si se acabó el juego
    var viven = 0;
    var superviviente = null;
    for (i in juego.jugadores) {
        if (juego.jugadores[i].bolas > 0) {
            superviviente = juego.jugadores[i];
            viven++;
            if (viven > 1)
                return;
        }
    }

    //Si llega hasta aquí, la partida ha acabado...
    juego.finalizar(superviviente);
};

Bola.prototype.updateEnOrbita = function(elapsedSeconds) {
    var r = Math.random();

    // Para el cálculo de colisiones
    this.vRPrevia = this.vR;

    if(Math.abs(this.vR * this.planeta.rg) < VEL_LIN_MIN) {
        this.vR += (this.vR > 0?1:-1) * r * this.incVr * elapsedSeconds;
    }

    // Avanzamos el ángulo
    this.ang += (this.vR * elapsedSeconds);

    // Corrección de vuelta entera
    if(Math.abs(this.ang) > 2 * Math.PI)
        this.ang -= 2 * Math.PI * signo(this.ang);

    this.x = this.planeta.x + this.planeta.rg * Math.cos(this.ang);
    this.y = this.planeta.y + this.planeta.rg * Math.sin(this.ang);

    //Sumar / restar velocidad
    // var vant = Math.abs(this.vR * this.planeta.rg);
    var vLineal = Math.abs(this.vR / this.planeta.rg);
    if(vLineal  < this.maxV)
        this.vR += r * this.incVr * elapsedSeconds * signo(this.vR);
    if(vLineal > this.maxV/2)
        this.vR -= r * this.incVr * elapsedSeconds * signo(this.vR) * 0.9;
    // Corrección cuando la velocidad es exageradamente alta
    if(vLineal > this.maxV*1.5)
        this.vR *= 0.8;

    // Control secundario
    if(this.jugador && keysDown[this.jugador.secondControlId]) {
        this.vR *= 0.95;
    }

    /*if(Math.abs(pl.vR * pl.Planeta.rg) -  vant > 0) //Aumento la v
        pl.color = "#00FF00";
    else if(Math.abs(pl.vR * pl.Planeta.rg) -  vant < 0) //Aumento la v
        pl.color = "#FF0000";
    else
        pl.color = "#FFFFFF";*/
};