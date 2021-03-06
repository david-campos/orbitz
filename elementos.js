// Jugadores (tienen un color y un id de control)
function Jugador(color, controlId, secondControlId) {
    this.bolas = 0;
    this.muertes = 0;
    this.tiempo = 0; // tiempo en el centro
    this.color = color;
    this.controlId = controlId;
    this.secondControlId = secondControlId;
    this.ultimaMuerte = 0;
    this.noRepetirSonidos = {};
    this.id = Jugador.ultId++;
}

Jugador.ultId = 1;
Jugador.prototype.asignarBola = function () {
    this.bolas++;
};

/**
 * @type {[[String, Number]]}
 */
var ast_tipos = [["Invincible", 20],
    ["Speed up x 2", 30],
    ["Speed down", 40],
    ["Out of the orbit!", 150],
    ["Invisible", 180],
    ["Useless asteroid", 210],
    ["Rebound!", 150],
    ["Lucky", 30],
    ["Own gravity", 30],
    ["Speed up", 180],
    ["Lifesaver", 210],
    ["Transport", 180],
    ["Reproductive", 20],
    ["Changing roles", 10],
    ["Stop", 5],
    ["Planet lover", 40],
    ["A Present", 25],
    ["Blind", 10],
    ["Speed down x 2", 30],
    ["Another chance", 20]];
var ast_prob_t = 0;
for (var i in ast_tipos) {
    ast_prob_t += parseInt(ast_tipos[i][1]);
    ast_tipos[i][1] = ast_prob_t;
}

function Asteroide(x, y) {
    this.x = x;
    this.y = y;
    var r = Math.random();
    this.duracion = 2000 + (r * 8000);

    var t = Math.floor(r * ast_prob_t);
    for (var i in ast_tipos) {
        if (parseInt(ast_tipos[i][1]) >= t) {
            this.tipo = parseInt(i);
            break;
        }
    }
}

Asteroide.prototype.hacerEfecto = function (bola) {
    var buenosTipos = [0, 1, 4, 8, 9, 10, 11];
    if (bola.fortuna) {
        this.tipo = buenosTipos[Math.floor(Math.random() * buenosTipos.length)];
    }
    // No darle el asteroide stop a las bolas sin jugador
    // sería un coñazo tener a todos los jugadores parados
    if (this.tipo === 14 && !bola.jugador) {
        this.tipo = 3;
    }
    switch (this.tipo) {
        case 0:
            bola.invencible = true;
            bola.invencibleTime = this.duracion;
            break;
        case 1:
            bola.vR *= 1.75;
            bola.v.x *= 1.75;
            bola.v.y *= 1.75;
            break;
        case 2:
            bola.vR *= 0.5;
            bola.v.x *= 0.5;
            bola.v.y *= 0.5;
            break;
        case 3:
            bola.salirOrb();
            break;
        case 4:
            bola.invisible = true;
            bola.invisibleTime = this.duracion;
            break;
        case 5:
            break;
        case 6:
            bola.vR *= -1;
            bola.v.x *= -1;
            bola.v.y *= -1;
            break;
        case 7:
            bola.fortuna = true;
            bola.fortunaTime = this.duracion * 10;
            break;
        case 8:
            bola.gravedad = true;
            bola.gravedadTime = this.duracion * 5;
            break;
        case 9:
            bola.vR *= 1.5;
            bola.v.x *= 1.5;
            bola.v.y *= 1.5;
            break;
        case 10:
            bola.salvado = true;
            break;
        case 11:
            bola.transportado = true;
            break;
        case 12: //Reproductive
            if (juego) {
                juego.asteroides.push(globf_generarAsteroide(juego));
                juego.asteroides.push(globf_generarAsteroide(juego));
                juego.asteroides.push(globf_generarAsteroide(juego));
            }
            break;
        case 13: // Changing roles
            if (juego) {
                for (var i in juego.bolas) {
                    var jugador = juego.bolas[i].jugador;
                    i = parseInt(i);
                    var otraBola = Math.floor(Math.random() * (juego.bolas.length - i)) + i;
                    juego.bolas[i].jugador = juego.bolas[otraBola].jugador;
                    juego.bolas[otraBola].jugador = jugador;
                }
            }
            reproducir(sonidos.dados);
            break;
        case 14: // Stop!
            if (juego) {
                juego.stopEffect = Date.now() + this.duracion/2;
                juego.stopper = bola;
            }
            break;
        case 15: // Planet lover
            bola.planetLover = this.duracion + 1000;
            break;
        case 16: // A Present
            if(juego) {
                juego.generarBola(bola.jugador, []);
            }
            break;
        case 17: // Blind
            if(juego) {
                juego.blindGame = this.duracion;
            }
            break;
        case 18: // Speed down x 2
            bola.vR *= 0.25;
            bola.v.x *= 0.25;
            bola.v.y *= 0.25;
            break;
        case 19: // Another chance
            if(juego) {
                juego.generarBola(null, []);
            }
            break;
        default:
            console.log("Asteroide tipo [", this.tipo, "] DESCONOCIDO.", this);
    }
    if (bola.jugador)
        Log.nuevaNota(ast_tipos[this.tipo][0], bola.jugador);
    else
        Log.nuevaNota(ast_tipos[this.tipo][0]);
};

function Planeta(x, y, r, rg, centro) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.centro = centro;
    if (this.centro) {
        this.mayor_t = 0;
        this.mayor_t_j = null;
    }
    this.bolas = [];
    var ran = Math.random();
    this.n_imagen = Math.floor(ran * PICS_PLANETAS_N);
    this.ang = ran * 10;
    this.vel = (0.001 + ran * 0.009) * Math.pow(-1, Math.floor(ran * 10));
    this.rotarEn = 0;

    //Si la imagen no se cargó para otro Planeta, se carga.
    this.cargarImagen();
    this.renderizado = null;

    this.rg = rg;
    this.nodisponible = 0; // Tiempo que está no disponible (se actualiza durante el juego)
    this.radioVariable = !centro && ran * 1000 < 100;
    if (this.radioVariable) {
        this.rr = rg;
        this.rv = 1.0;
        this.crece = false;
    }
    if (this.r < 35 && Math.random() < PROB_INQUIETO) {
        this.inquieto = true;
        this.movingV = 10 + Math.random() * 20; // Muy lentitos
        this.dir = {x: Math.random() * 2 - 1, y: Math.random() * 2 - 1};
        var mod = moduloVector(this.dir.x, this.dir.y);
        this.dir.x /= mod;
        this.dir.y /= mod;
    }
}

Planeta.prototype.update = function (elapsedSeconds) {
    if (this.radioVariable) {
        if (this.crece)
            this.rv += 0.001;
        else
            this.rv -= 0.001;
        if (this.rv <= 0.75) {
            this.rv = 0.75;
            this.crece = true;
        }
        if (this.rv >= 1) {
            this.rv = 1;
            this.crece = false;
        }
        this.rg = this.rr * this.rv;
    }

    if (this.inquieto) {
        this.dir.x += Math.random() * 0.1 - 0.05;
        this.dir.y += Math.random() * 0.1 - 0.05;
        var mod = moduloVector(this.dir.x, this.dir.y);
        // Velocidad
        this.dir.x *= this.movingV * elapsedSeconds / mod;
        this.dir.y *= this.movingV * elapsedSeconds / mod;

        var valido = true;
        var rg = (this.radioVariable ? this.rr : this.rg);
        var margen = rg + 2 * RADIO_BOLAS;
        var nuevaY = this.y + this.dir.y;
        var nuevaX = this.x + this.dir.x;
        if (nuevaX > margen && nuevaX < MAP.w - margen && nuevaY > margen && nuevaY < MAP.h - margen) {
            for (var i in juego.planetas) {
                var otroP = juego.planetas[i];

                if (otroP === this)
                    continue;

                var otroRg = (otroP.radioVariable ? otroP.rr : otroP.rg);
                if (moduloVector(otroP.x - nuevaX, otroP.y - nuevaY) < otroRg + margen) {
                    valido = false;
                    break;
                }
            }
            if (valido) {
                this.x = nuevaX;
                this.y = nuevaY;
            } else {
                if (Math.random() > 0.5) {
                    this.dir.x *= -1;
                } else {
                    this.dir.y *= -1;
                }
            }
        }
    }

    this.bolasUpdate(elapsedSeconds);
};

/**
 * Actualización física de las bolas que orbitan el planeta
 * @param {Number} elapsedSeconds segundos pasados desde el último frame
 */
Planeta.prototype.bolasUpdate = function (elapsedSeconds) {
    var bolasConJugador = [];

    for (var i in this.bolas) {
        var bola = this.bolas[i];
        bola.updateEnOrbita(elapsedSeconds);

        // Si esto es un centro y la bola tiene jugador,
        // lo contamos
        if (this.centro && bola.jugador)
            bolasConJugador.push(bola);
        bola = this.bolas[i];

        // Salir de la órbita si el jugador quiere y la velocidad lineal
        // es suficiente
        if (bola.jugador && keysDown[bola.jugador.controlId]) {
            var lin = Math.abs(bola.vR * this.rg);
            if (lin > VEL_LIN_MIN) {
                bola.salirOrb();
            } else if (!bola.jugador.noRepetirSonidos.cinta) {
                bola.jugador.noRepetirSonidos.cinta = true;
                reproducir(sonidos.cinta);
            }
            continue;
        }

        // Si es invisible no colisiona
        if (bola.invisible)
            continue;

        // Colisiones
        // Recorremos todas las anteriores bolas del planeta,
        // nótese que todas han sido actualizadas y tienen su vRPrevio correcto
        for (var j = i; j >= 0; j--) {
            var otra = this.bolas[j];
            // No colisionan si la otra es invisible o llevan la misma velocidad
            // (es muy muy difícil que lleven la misma velocidad, dado que las variaciones son aleatorias)
            if (otra.invisible || otra.vRPrevia === bola.vRPrevia) continue;

            // Dividimos en cuatro puntos el recorrido y comprobamos la colisión en cada uno
            var rs = bola.r + otra.r;
            var col = false;
            for (var k = 0; !col && k < 4; k++) {
                col = moduloVector(
                    bola.x - k / 4 * bola.vRPrevia - otra.x + k / 4 * otra.vRPrevia,
                    bola.y - k / 4 * bola.vRPrevia - otra.y + k / 4 * otra.vRPrevia) < rs;
            }

            if (col) {
                // Si estamos en stop
                if (juego && juego.stopEffect) {
                    if (juego.stopper === bola) {
                        otra.vR = bola.vR;
                        otra.salirOrb();
                    } else if (juego.stopper === otra) {
                        bola.vR = otra.vR;
                        bola.salirOrb();
                    }
                } else {
                    if (bola.vR * otra.vR <= 0) {
                        //Choque frontal
                        var pvR = Math.abs(bola.vR);
                        var bvR = Math.abs(otra.vR);
                        bola.vR *= -1;
                        otra.vR *= -1;

                        if (pvR <= bvR && !bola.invencible) {
                            //bola más lento o iguales
                            bola.vR *= 1.35;
                            otra.vR *= 0.85;
                            bola.salirOrb();
                        }
                        if (pvR >= bvR && !otra.invencible) {
                            //bola más rápido o iguales
                            bola.vR *= 0.85;
                            otra.vR *= 1.35;
                            otra.salirOrb();
                        }
                    } else {
                        //Choque por detrás
                        if (Math.abs(bola.vR) < Math.abs(otra.vR)) {
                            bola.vR = otra.vR;
                            otra.vR = bola.vR * 0.85;
                            if (!bola.invencible) bola.salirOrb();
                        } else {
                            otra.vR = bola.vR;
                            bola.vR = otra.vR * 0.85;
                            if (!otra.invencible) otra.salirOrb();
                        }
                    }
                }
                reproducir(sonidos.pong);
                if (bola.invencible)
                    otra.salirOrb();
                if (otra.invencible)
                    bola.salirOrb();
                break;
            }
        }
    }

    // Solo cuenta para el centro cuando una bola es la única
    // de algún jugador en el planeta.
    if (this.centro && bolasConJugador.length === 1) {
        var jug = bolasConJugador[0].jugador;
        if (jug && this.centro) {
            if (this.ultimo) this.ultimo.ultimo = false;
            this.ultimo = jug;
            jug.ultimo = true;

            jug.tiempo += elapsedSeconds;
            if (jug.tiempo > this.mayor_t) {
                this.mayor_t = jug.tiempo;
                this.mayor_t_j = jug;
            }
        }
    }
};

/**
 * Si no se cargó la imagen para otro planeta, la cargamos ahora
 */
Planeta.prototype.cargarImagen = function () {
    var self = this;
    self.imagen = new Image();
    self.imagen.src = "img/planeta_" + this.n_imagen + ".png";
    self.imagen.onload = function () {
        self.renderizado = document.createElement("canvas");
        self.renderizado.width = 2*self.r;
        self.renderizado.height = 2*self.r;
        self.ctx = self.renderizado.getContext("2d");
        self.ctx.save();
        self.rotar();
    };
};

Planeta.prototype.rotar = function() {
    if(this.renderizado) {
        this.ctx.clearRect(0, 0, this.r*2, this.r*2);
        this.ctx.save();
        this.ctx.translate(this.r, this.r);
        this.ctx.rotate(this.ang);
        this.ang = (this.ang + this.vel)%(2*Math.PI);
        this.ctx.drawImage(this.imagen,
            -this.r,
            -this.r,
            this.r*2,
            this.r*2);
        this.ctx.restore();
    }
    this.rotarEn = Date.now() + 100;
};

function Agujero(x, y, r, c, a) {
    this.x = x;
    this.y = y;
    this.r = r >= c ? r : c; //Radio (en el que absorbe, no puede ser menor que c)
    this.c = c; //Centro (en el que pierdes)
    this.a = a; //Aceleración que imprime hacia él (pixels/segundo^2)
    this.ang = 0; //Angulo para la rotacion (grafica)
}