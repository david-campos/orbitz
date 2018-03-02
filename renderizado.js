var imgAgujero = new Image();
var transposicionY = 0;
var prerenderizados = {};
var puntosDebug = [];

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
 * Pre-renderiza con una funcion de dibujo sobre un nuevo canvas y lo devuelve
 * @param {int} width ancho del canvas
 * @param {int} height alto del canvas
 * @param {function(CanvasRenderingContext2D)} funcionDibujo función para dibujar el elemento
 * @returns {HTMLCanvasElement}
 */
function preRenderizar(width, height, funcionDibujo) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var canvasCtx = canvas.getContext('2d');
    funcionDibujo(canvasCtx);
    return canvas;
}

function generarPreRenderizados() {
    prerenderizados = {
        asteroide: preRenderizar(10, 10, dibujarAsteroide)
    };
}

/**
 * Renderiza el juego
 * @param {Game} juego
 */
var render = function(juego) {
    ctx.clearRect(0,0,canvas.width / glob_escala.w,canvas.height / glob_escala.h);

    // Escalado del juego
    if(glob_escala.update) {
        glob_escala.update = false;
        ctx.scale(glob_escala.w, glob_escala.h);
        transposicionY = (canvas.height - glob_escala.h * MAP.h) * 0.5 / glob_escala.h;
    }
    // Transposición para centrar el escalado
    ctx.save();
    if(glob_escala.dominaAncho && glob_escala.h < 1) {
        ctx.translate(0, transposicionY);
    }

	//Planetas
	for(var i in juego.planetas)
		dibujarPlaneta(juego, juego.planetas[i]);

	//Asteroides
	for(i in juego.asteroides) {
		var as = juego.asteroides[i];
		ctx.drawImage(
		    prerenderizados.asteroide,
            as.x - prerenderizados.asteroide.width/2,
            as.y - prerenderizados.asteroide.height/2,
            prerenderizados.asteroide.width,
            prerenderizados.asteroide.height);
	}
	
	//Agujeros
	for(i in juego.agujeros) {
		var ag = juego.agujeros[i];
		ctx.save();
		ctx.translate(ag.x, ag.y);
		ctx.rotate(ag.ang);
		ag.ang = (ag.ang + 0.002)%(2*Math.PI);
		ctx.drawImage(imgAgujero, -ag.r, -ag.r, 2*ag.r, 2*ag.r);
		ctx.restore();
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
		
		grd = ctx.createRadialGradient(bola.x,bola.y,0,bola.x,bola.y,bola.r - 1);
		ctx.beginPath();
		
        if(bola.salvado)
            grd.addColorStop(0,"#ffff00");
        else
			grd.addColorStop(0,bola.color);
		
		if(bola.invisible)
			grd.addColorStop(0.5, "rgba(0,0,0,0)");
		
		if(bola.jugador)
			grd.addColorStop(1, bola.jugador.color);
		else
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

	ctx.restore();

	// Debug mode
	if(glob_debugMode) {
	    var textos = [
	        "FPS: " + glob_fps,
            "min: " + glob_fps_min
        ];
        ctx.save();
        ctx.font = "bold 30px \"Courier New\"";
        ctx.fillStyle = "red";
        for(i=0;i<textos.length;i++) {
            var text = textos[i];
	        if (text.length < 10) {
                for (var j = 0; j < 10 - text.length; j++)
                    text += " ";
            }
            var width = ctx.measureText(text).width;
            ctx.save();
            ctx.fillText(text, MAP.w - width, 40);
            ctx.restore();
            ctx.translate(0, 30);
        }
        ctx.restore();
    }

	//Notas
    ctx.save();
    var notasSize = 20;
	ctx.font="bold "+notasSize+"px Orbitron";
    var blur = 10;
    ctx.shadowColor = "#471468";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = blur;

    for(i in Log.notas) {
		// Create gradient
		//var gradient=ctx.createLinearGradient(0,0,200,0);
		//gradient.addColorStop(0.25,notas[i].color);
		//gradient.addColorStop(0.75,"white");
		// Fill with gradient
        ctx.fillStyle=Log.notas[i].color;
		ctx.fillText(Log.notas[i].mensaje, 20, 40 + i * notasSize * 1.2);
	}
	ctx.restore();
	
	//Reloj
	if(juego.modo !== MODOS.CLASICO && juego.duracion > 0) {
		// Math.round(jugadores[i].ultimaMuerte/60000) mins
		var restante =  Math.round(juego.duracion*30 - (Date.now() - juego.inicioPartida)/2000);
               
		if(restante < 0 || restante > 9) return;
        
        var rojo = juego.duracion*60000 - (Date.now() - juego.inicioPartida); //Restante en milisegundos
        rojo = rojo%2000; //Cíclico cada 2 segundos
        rojo = (Math.sin(rojo/1000*Math.PI+Math.PI/4)+1)/2;
        for(i=1;i<=restante;i++) {
		    ctx.beginPath();
		    ctx.rect(MAP.w / 2 - 50 + i*2 + (i-1)*9, MAP.h - 28, 9, 18);
		    ctx.fillStyle = "rgba(200,0,0,"+rojo+")";
		    ctx.fill();
		    ctx.closePath();
        }
	}
};

function dibujarPlaneta(juego, p) {
	//Los planetas tambien tienen gradiente
	var grd = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.rg);
	
	if(p.centro){
		if(p.mayor_t_j !== null) {
            var segundo_mayor = 0;
            for(var idx in juego.jugadores) {
                if(juego.jugadores[idx] !== p.mayor_t_j &&
                    juego.jugadores[idx].tiempo > segundo_mayor) {
                        segundo_mayor = juego.jugadores[idx].tiempo;
                    }
            }
	        grd.addColorStop(0.7 * Math.min(p.mayor_t - segundo_mayor, 30) / 30 + 0.2, p.mayor_t_j.color);
	    } else {
            grd.addColorStop(0, "rgba(80, 200, 80, 0.4)");
        }
        grd.addColorStop(1,"rgba(80, 200, 80, 0.1)");
	}
	else if(!p.nodisponible)
	{
		if(p.radioVariable)
		{
			grd.addColorStop(0,"rgba(200, 45, 180, 0.4)");
			grd.addColorStop(1,"rgba(200, 45, 180, 0.1)");
		}else{
			grd.addColorStop(0,"rgba(90, 45, 180, 0.4)");
			grd.addColorStop(1,"rgba(90, 45, 180, 0.1)");
		}
	}else{
		grd.addColorStop(0,"rgba(80, 80, 80, 0.4)");
		grd.addColorStop(1,"rgba(80, 80, 80, 0.1)");
	}
	ctx.beginPath();
	ctx.arc(p.x, p.y, p.rg, 0, 2*Math.PI);
	ctx.fillStyle = grd;
	ctx.fill();
	ctx.closePath();
	
	//Centro del Planeta
	if(glob_plt_imgs[p.n_imagen].ready) {
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.rotate(p.ang);
		p.ang = (p.ang + p.vel)%(2*Math.PI);
		ctx.drawImage(glob_plt_imgs[p.n_imagen], -((0.5 + p.r) | 0), -((0.5 + p.r) | 0), 2*((0.5 + p.r) | 0), 2*((0.5 + p.r) | 0));
		ctx.restore();
	}else{
		grd = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
		grd.addColorStop(0,"#4A392C");
		grd.addColorStop(1,"#12171A");
		ctx.beginPath();
		ctx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
		ctx.fillStyle = grd;
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
    canvas.height = height;

    // Escalamos manteniendo la proporción
    var escalaAncho = width / MAP.w;
    var escalaAlto = height / MAP.h;

    glob_escala = {
        w: escalaAncho>escalaAlto? escalaAlto: escalaAncho,
        h: escalaAlto>=escalaAncho? escalaAncho: escalaAlto,
        dominaAncho: escalaAlto>=escalaAncho,
        update: true
    };
}

function debugPunto(x, y, color) {
    puntosDebug.push({x:x, y:y, color: color});
}