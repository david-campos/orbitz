var imgAgujero = new Image();
var iconos_asteroides = {
    invencible: new Image(),
    invisible: new Image(),
    fortuna: new Image(),
    gravedad: new Image(),
    salvador: new Image(),
    transporte: new Image(),
    planetLover: new Image()
};
for(var imagen in iconos_asteroides) {
    iconos_asteroides[imagen].ready = false;
    iconos_asteroides[imagen].onload = function () {
        this.ready = true;
    };
}
var transposicionY = 0;
var prerenderizados = {};
var puntosDebug = [];
var siguienteRenderLento = 0;

/**
 * @param {CanvasRenderingContext2D} ctx
 */
function dibujarAsteroide(ctx) {
    var grd = ctx.createRadialGradient(0,0,0,0,0,4);
    ctx.save();
    ctx.translate(5, 5);
    ctx.beginPath();
    grd.addColorStop(0,"black");
    grd.addColorStop(1,"white");
    ctx.arc(0, 0, 5, 0, 2*Math.PI);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Image} icono
 * @param {String} color
 */
function colorearIcono(ctx, icono, color) {
    ctx.fillStyle = color;
    ctx.rect(0, 0, 215, 215);
    ctx.fill();
    ctx.globalCompositeOperation = "destination-atop";
    ctx.drawImage(icono, 0, 0, 215, 215);
}

/**
 * Pre-renderiza con una funcion de dibujo sobre un nuevo canvas y lo devuelve
 * @param {int} width ancho del canvas
 * @param {int} height alto del canvas
 * @param {function(CanvasRenderingContext2D, Object,Object)} funcionDibujo función para dibujar el elemento
 * @param param1 parametro opcional 1
 * @param param2 parametro opcional 2
 * @returns {HTMLCanvasElement}
 */
function preRenderizar(width, height, funcionDibujo, param1, param2) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var canvasCtx = canvas.getContext('2d');
    funcionDibujo(canvasCtx, param1, param2);
    return canvas;
}

function generarPreRenderizados(juego) {
    prerenderizados = {
        asteroide: preRenderizar(10, 10, dibujarAsteroide),
        paletaIconos: []
    };
    for(var i in juego.jugadores) {
        var color = juego.jugadores[i].color;
        prerenderizados.paletaIconos[i] = {
            invencible: preRenderizar(215, 215, colorearIcono, iconos_asteroides.invencible, color),
            invisible: preRenderizar(215, 215, colorearIcono, iconos_asteroides.invisible, color),
            fortuna: preRenderizar(215, 215, colorearIcono, iconos_asteroides.fortuna, color),
            gravedad: preRenderizar(215, 215, colorearIcono, iconos_asteroides.gravedad, color),
            salvador: preRenderizar(215, 215, colorearIcono, iconos_asteroides.salvador, color),
            transporte: preRenderizar(215, 215, colorearIcono, iconos_asteroides.transporte, color),
            planetLover: preRenderizar(215, 215, colorearIcono, iconos_asteroides.planetLover, color)
        };
    }
}

/**
 * Renderiza el juego
 * @param {Game} juego
 */
var render = function(juego) {
    var now = Date.now();

    if(now > siguienteRenderLento) {
        renderLento();
        siguienteRenderLento = now + RENDERIZADO_LENTO_TIME;
    }

    // Limpiamos
    ctx.clearRect(0,0,canvas.width/ glob_escala.w,canvas.height/ glob_escala.h);

    // Escalado del juego
    if(glob_escala.update) {
        glob_escala.update = false;
        ctx.scale(glob_escala.w, glob_escala.h);
    }

    // Transposición para centrar el escalado
    ctx.save();
    if(glob_escala.dominaAncho && glob_escala.h < 1) {
        ctx.translate(0, transposicionY);
    }

	//Planetas
    if(!juego.blindGame) {
        for (var i in juego.planetas)
            dibujarPlaneta(juego, juego.planetas[i]);
    }

	//Asteroides
	for(i in juego.asteroides) {
		var as = juego.asteroides[i];
		ctx.drawImage(
		    prerenderizados.asteroide,
            (0.5 + as.x - prerenderizados.asteroide.width/2) << 0,
            (0.5 + as.y - prerenderizados.asteroide.height/2) <<0,
            (0.5 + prerenderizados.asteroide.width) << 0,
            (0.5 + prerenderizados.asteroide.height) << 0);
	}
	
	//Agujeros
    if(!juego.blindGame) {
        for (i in juego.agujeros) {
            var ag = juego.agujeros[i];
            ctx.save();
            ctx.translate(ag.x, ag.y);
            ctx.rotate(ag.ang);
            ag.ang = (ag.ang + 0.002) % (2 * Math.PI);
            ctx.drawImage(imgAgujero, -ag.r, -ag.r, 2 * ag.r, 2 * ag.r);
            ctx.restore();
        }
    }
	
	//Bolas
	for(i in juego.bolas) {
		var bola = juego.bolas[i];
		if(!bola.viva) continue;
		if(bola.gravedad) {
			var grd = ctx.createRadialGradient(bola.x,bola.y,0,bola.x,bola.y,bola.r * 2);
			grd.addColorStop(0,"rgba(182, 247, 77, 0.4)");
			grd.addColorStop(1,"rgba(182, 247, 77, 0.1)");
			
			ctx.beginPath();
			ctx.arc(bola.x, bola.y, bola.r * 2, 0, 2*Math.PI);
			ctx.fillStyle = grd;
			ctx.fill();
			ctx.closePath();
		}

		if(bola.planetLover) {
		    var r = (now % 1200)/400 + 1; // Max = 4, min=1
		    r = Math.sqrt(r) * bola.r;
            var grd = ctx.createRadialGradient(bola.x,bola.y,0,bola.x,bola.y,r);
            grd.addColorStop(0,"rgba(140, 0, 0, 0.0)");
            grd.addColorStop(0.7,"rgba(140, 0, 0, 0.0)");
            grd.addColorStop(1,"rgba(140, 0, 0, 0.8)");

            ctx.beginPath();
            ctx.arc(bola.x, bola.y, r, 0, 2*Math.PI);
            ctx.fillStyle = grd;
            ctx.fill();
            ctx.closePath();
        }
		
		grd = ctx.createRadialGradient(bola.x,bola.y,0,bola.x,bola.y,bola.r - 1);
		ctx.beginPath();
		
        if(bola.salvado)
            grd.addColorStop(0,"#ffff00");
        else
			grd.addColorStop(0,bola.color);
		
		if(bola.invisible)
			grd.addColorStop(0.5, "rgba(0,0,0,0)");
		
		if(bola.jugador) {
            grd.addColorStop(1, bola.jugador.color);
        } else
			grd.addColorStop(1, "gray");
			
		var alpha;
		if(bola.fortuna) {
			alpha = Math.abs(2000 - (bola.fortunaTime % 4000))/2000;
			if(!bola.invencible) ctx.shadowColor = "rgba(0, 255, 0, "+alpha+")";
			else ctx.shadowColor = "green";
		}
		if(bola.invencible && (!bola.fortuna || alpha <= 0.5) )
			ctx.shadowColor = "white";
			
		if(bola.invencible || bola.fortuna)
			ctx.shadowBlur = 10;
		
        if(!bola.planeta && bola.transportado) {
            var ang = Math.atan2(bola.v.y, bola.v.x)+Math.PI;
            
            ctx.moveTo(bola.x, bola.y);
            ctx.lineTo(bola.x + 1.5 * bola.r * Math.cos(ang+Math.PI/4), bola.y + 1.5 * bola.r * Math.sin(ang+Math.PI/4));
            ctx.lineTo(bola.x + 1.5 * bola.r * Math.cos(ang+Math.PI), bola.y + 1.5 * bola.r * Math.sin(ang+Math.PI));
            ctx.lineTo(bola.x + 1.5 * bola.r * Math.cos(ang-Math.PI/4), bola.y + 1.5 * bola.r * Math.sin(ang-Math.PI/4));
            ctx.fillStyle = grd;
            ctx.fill();
        } else {
            ctx.arc(bola.x, bola.y, bola.r, 0, 2*Math.PI);
            ctx.fillStyle = grd;
            ctx.fill();
            if(bola.jugador) {
                if(now - juego.inicioPartida > 1000 && now - juego.inicioPartida < 3000) {
                    ctx.strokeStyle = bola.jugador.color;
                    var restan = (3000-(now-juego.inicioPartida))/4000;
                    ctx.save();
                    ctx.globalAlpha = restan*restan;
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.arc(bola.x, bola.y, Math.sqrt((now-juego.inicioPartida-1000)*100), 0, 2*Math.PI);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        ctx.closePath();
		ctx.shadowBlur = 0;
	}

    // Puntos de debug
    for(i in puntosDebug) {
        ctx.beginPath();
        if(puntosDebug[i].color) {
            ctx.fillStyle = puntosDebug[i].color;
        } else {
            grd = ctx.createRadialGradient(puntosDebug[i].x, puntosDebug[i].y, 0, puntosDebug[i].x, puntosDebug[i].y, 4);
            grd.addColorStop(0, "#00ff00");
            grd.addColorStop(1, "#ff00ff");
            ctx.fillStyle = grd;
        }
        ctx.arc(puntosDebug[i].x, puntosDebug[i].y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    //Reloj
    if(juego.duracion > 0) {
        // Math.round(jugadores[i].ultimaMuerte/60000) mins
        var restante =  Math.round(juego.duracion*30 - (now - juego.inicioPartida)/2000);

        if(restante >= 0 && restante < 10) {
            var rojo = juego.duracion * 60000 - (now - juego.inicioPartida); //Restante en milisegundos
            rojo = rojo % 2000; //Cíclico cada 2 segundos
            rojo = (Math.sin(rojo / 1000 * Math.PI + Math.PI / 4) + 1) / 2;
            for (i = 1; i <= restante; i++) {
                ctx.beginPath();
                ctx.rect(MAP.w / 2 - 200 + i * 4 + (i - 1) * 19, MAP.h - 40, 19, 36);
                ctx.fillStyle = "rgba(200,0,0," + rojo + ")";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
	ctx.restore();
};

function renderLento() {
    // Escalado del juego
    scdCtx.clearRect(0,0,secondCanvas.width / glob_escala.w,secondCanvas.height / glob_escala.h);
    if(glob_escala.update2) {
        glob_escala.update2 = false;
        scdCtx.scale(glob_escala.w, glob_escala.h);
    }

    // Transposición para centrar el escalado
    scdCtx.save();
    if(glob_escala.dominaAncho && glob_escala.h < 1) {
        scdCtx.translate(0, transposicionY);
    }

    //Planetas
    if(!juego.blindGame) {
        for (var i in juego.planetas)
            renderPlanetaEstatico(juego.planetas[i]);
    }
    scdCtx.restore();


    // A PARTIR DE AQUÍ NO HAY TRANSPOSICIÓN (SÍ ESCALADO)
    // Modo de juego
    scdCtx.save();
    scdCtx.font="bold 20px Orbitron";
    scdCtx.shadowColor = "#471468";
    scdCtx.shadowOffsetX = 0;
    scdCtx.shadowOffsetY = 0;
    scdCtx.shadowBlur = 10;

    // Create gradient
    var gradient=scdCtx.createLinearGradient(0,0,200,0);
    gradient.addColorStop(0.25,"gray");
    gradient.addColorStop(0.75,"white");
    // Fill with gradient
    scdCtx.fillStyle=gradient;
    var w = scdCtx.measureText(juego.modo).width;
    scdCtx.fillText(juego.modo, MAP.w - w - 20, 40);
    scdCtx.restore();

    // Debug mode
    if(glob_debugMode) {
        var textos = [
            "FPS: " + glob_fps,
            "min: " + glob_fps_min
        ];
        scdCtx.save();
        scdCtx.font = "bold 30px \"Courier New\"";
        scdCtx.fillStyle = "red";
        for(i=0;i<textos.length;i++) {
            var text = textos[i];
            if (text.length < 10) {
                for (var j = 0; j < 10 - text.length; j++)
                    text += " ";
            }
            var width = scdCtx.measureText(text).width;
            scdCtx.save();
            scdCtx.fillText(text, MAP.w - width - w, 40);
            scdCtx.restore();
            scdCtx.translate(0, 30);
        }
        scdCtx.restore();
    }

    dibujarInterfazAsteroides(juego);

    //Notas
    scdCtx.save();
    var notasSize = 20;
    scdCtx.font="bold "+notasSize+"px Orbitron";
    var blur = 10;
    scdCtx.shadowColor = "#471468";
    scdCtx.shadowOffsetX = 0;
    scdCtx.shadowOffsetY = 0;
    scdCtx.shadowBlur = blur;

    for(i in Log.notas) {
        // Create gradient
        //var gradient=ctx.createLinearGradient(0,0,200,0);
        //gradient.addColorStop(0.25,notas[i].color);
        //gradient.addColorStop(0.75,"white");
        // Fill with gradient
        scdCtx.fillStyle=Log.notas[i].color;
        scdCtx.fillText(Log.notas[i].mensaje, 20, 40 + i * notasSize * 1.2);
    }
    scdCtx.restore();
}

function renderPlanetaEstatico(p) {
    if(p.renderizado) {
        p.rotar();
    }

    // Orbitas no estaticas
    if(p.centro || p.inquieto || p.radioVariable) return;

    //Los planetas tambien tienen gradiente
    var grd = scdCtx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.rg);

    if(p.nodisponible) {
        grd.addColorStop(0,"rgba(80, 80, 80, 0.4)");
        grd.addColorStop(1,"rgba(80, 80, 80, 0.1)");
    } else {
        grd.addColorStop(0,"rgba(90, 45, 180, 0.2)");
        grd.addColorStop(1,"rgba(90, 45, 180, 0.1)");
    }
    scdCtx.beginPath();
    scdCtx.arc(p.x, p.y, p.rg, 0, 2*Math.PI);
    scdCtx.fillStyle = grd;
    scdCtx.fill();
    scdCtx.closePath();

    if(p.renderizado) {
        scdCtx.drawImage(p.renderizado, p.x -((0.5 + p.r) << 0), p.y -((0.5 + p.r) << 0));
    }else{
        scdCtx.beginPath();
        scdCtx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
        scdCtx.fillStyle = "#4A392C";
        scdCtx.fill();
        scdCtx.closePath();
    }
}

function dibujarPlaneta(juego, p) {
    // Descartar los de órbita estática!
    if(!p.centro && !p.inquieto && !p.radioVariable) return;

    if (p.centro) {
        var grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.rg);
        if (p.mayor_t_j !== null) {
            var segundo_mayor = 0;
            for (var idx in juego.jugadores) {
                if (juego.jugadores[idx] !== p.mayor_t_j &&
                    juego.jugadores[idx].tiempo > segundo_mayor) {
                    segundo_mayor = juego.jugadores[idx].tiempo;
                }
            }
            grd.addColorStop(0.7 * Math.min(p.mayor_t - segundo_mayor, 30) / 30 + 0.2, p.mayor_t_j.color);
        } else {
            grd.addColorStop(0, "rgba(80, 200, 80, 0.2)");
        }
        grd.addColorStop(1, "rgba(80, 200, 80, 0.1)");
    } else if (p.inquieto) {
        grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.rg);
        grd.addColorStop(0, "rgba(255, 255, 255, 0.4)");
        grd.addColorStop(1, "rgba(0, 0, 0, 0.1)")
    } else if (p.radioVariable) {
        grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.rg);
        grd.addColorStop(0, "rgba(200, 45, 180, 0.2)");
        grd.addColorStop(1, "rgba(200, 45, 180, 0.1)")
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.rg, 0, 2 * Math.PI);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.closePath();

    //Centro del Planeta
    if(p.renderizado) {
        ctx.drawImage(p.renderizado, p.x -((0.5 + p.r) << 0), p.y -((0.5 + p.r) << 0));
    }else{
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
        ctx.fillStyle = "#4A392C";
        ctx.fill();
        ctx.closePath();
    }
}

window.onresize = function() {
    redimensionar(window.innerWidth, window.innerHeight);
};

// Redimensiona el juego adecuadamente
function redimensionar(width, height) {
    if(width < MIN_W || height < MIN_H) {
        resolucionInsuficiente(true);
        return;
    } else {
        resolucionInsuficiente(false);
    }

    // El canvas tendrá la resolución especificada
    canvas.width = width;
    secondCanvas.width = width;
    canvas.height = height;
    secondCanvas.height = height;

    // Escalamos manteniendo la proporción
    var escalaAncho = width / MAP.w;
    var escalaAlto = height / MAP.h;

    glob_escala = {
        w: escalaAncho>escalaAlto? escalaAlto: escalaAncho,
        h: escalaAlto>=escalaAncho? escalaAncho: escalaAlto,
        dominaAncho: escalaAlto>=escalaAncho,
        update: true,
        update2: true
    };
    transposicionY = (canvas.height - glob_escala.h * MAP.h) * 0.5 / glob_escala.h;
}

function debugPunto(x, y, color) {
    puntosDebug.push({x:x, y:y, color: color});
}

/**
 * @param {Game} juego
 */
function dibujarInterfazAsteroides(juego) {
    var asteroides = [];
    for(var i in juego.jugadores) {
        asteroides[i] = {};
    }
    for(i in juego.bolas) {
        var bola = juego.bolas[i];
        if(bola.jugador) {
            var jg = asteroides[juego.jugadores.indexOf(juego.bolas[i].jugador)];
            jg.invencible = jg.invencible || bola.invencible;
            jg.invisible = jg.invisible || bola.invisible;
            jg.fortuna = jg.fortuna || bola.fortuna;
            jg.gravedad = jg.gravedad || bola.gravedad;
            jg.salvador = jg.salvador || bola.salvado;
            jg.transporte = jg.transporte || bola.transportado;
            jg.planetLover = jg.planetLover || bola.planetLover;
        }
    }
    var iconos = [];
    for(i in asteroides) {
        var jugador = asteroides[i];
        if(jugador.invencible)
            iconos.push(prerenderizados.paletaIconos[i].invencible);
        if(jugador.invisible)
            iconos.push(prerenderizados.paletaIconos[i].invisible);
        if(jugador.fortuna)
            iconos.push(prerenderizados.paletaIconos[i].fortuna);
        if(jugador.gravedad)
            iconos.push(prerenderizados.paletaIconos[i].gravedad);
        if(jugador.transporte)
            iconos.push(prerenderizados.paletaIconos[i].transporte);
        if(jugador.salvador)
            iconos.push(prerenderizados.paletaIconos[i].salvador);
        if(jugador.planetLover)
            iconos.push(prerenderizados.paletaIconos[i].planetLover);

    }
    var espacio_ico = canvas.width / 24; // 6 habilidades x 4 jugadores = 24
    var lado_ico = espacio_ico * 0.8;
    var margen_ico = espacio_ico * 0.1;
    var espacioOcupado = iconos.length * espacio_ico;
    var margen_izq = (canvas.width - espacioOcupado)/2;
    ctx.save();
    ctx.shadowColor = "#471468";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 10;
    ctx.scale(1/glob_escala.w, 1/glob_escala.h);
    ctx.translate(margen_izq, canvas.height - espacio_ico);
    for(i in iconos) {
        ctx.translate(margen_ico, 0);
        ctx.drawImage(iconos[i], 0, 0, lado_ico, lado_ico);
        ctx.translate(lado_ico + margen_ico, 0);
    }
    ctx.restore();
}