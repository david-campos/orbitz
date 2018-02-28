var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

var scr = {w: 0, h: 0};

w.onload = function() {
    if(genAgujeros)
        imgAgujero.src = "img/agujero.png";

    scr = {w: window.innerWidth, h: window.innerHeight};
    canvas.width = scr.w;
    canvas.height = scr.h;
};

var canvas = document.getElementById("mainframe");
var ctx = canvas.getContext("2d");


modos = ["Clásico", "Instinto", "Centro"];

var then;
function iniciar() {
    then = Date.now();
    document.getElementById("inicio").style.display = "none";
    document.getElementById("juego").style.display = "block";
    restart();
}

var inicio_partida=0;
var restart = function()
//(Re)comienza el juego
{
	gamefin = true;
	if(planetas.length > 0)
		planetas.splice(0, planetas.length);
	if(planetasRV.length > 0)
		planetasRV.splice(0, planetasRV.length);
	if(planetasND.length > 0)
		planetasND.splice(0, planetasND.length);
	if(agujeros.length > 0)
		agujeros.splice(0, agujeros.length);
	if(bolas.length > 0)
		bolas.splice(0, bolas.length);
	if(jugadores.length > 0)
		jugadores.splice(0, jugadores.length);
	if(asteroides.length > 0)
		asteroides.splice(0, asteroides.length);
	if(notas.length > 0)
		notas.splice(0, notas.length);
	
	jugador.ultId = 1;
	
	//MODOS
	// 0 -> Clásico (El último vivo gana.)
	// 1 -> Instinto (El que muere menos veces gana.)
	// 2 -> El centro (Dominar planeta central por más tiempo.)
	if(!modo || modo < 0 || modo > 2) modo = 0;
	
	var i=0;
	var ht = "<p>Modo: "+modos[modo];
	if(duracion > 0 && modo != 0)
	{
		var mins = Math.floor(duracion);
		var secs = Math.round((duracion - mins)*60);
		ht+=" ("+mins+"' "+secs+"\")";
	}
	document.getElementById("datos").innerHTML=ht+"</p>";
	
	switch(modo)
	{
		case 2:
			var miP = new planeta(scr.w/2, scr.h/2, 70, 140, true);
			planetas.push(miP);
			i++;
		case 1:
		case 0:
			//Generar planetas
			if(planetasMax == -1) planetasMax = bolasN;
			
			for(i=i;i<planetasMax; i++)
				if(!generarPlanetaRandom(20, 40))
					break;

			//Generar jugadores
			if(bolasN < 0) bolasN = 10;
			if(jugadoresN<0 || jugadoresN > bolasN/bolasXjugador) jugadoresN = Math.floor(bolasN/bolasXjugador);
			
			var p_copia = planetas.slice(0);
			if(modo == 2)
			{
				for(i in p_copia)
					if(p_copia[i].centro)
					{
						p_copia.splice(i, 1);
						break;
					}
			}
			
			var j=0;
			for(i=0; i < bolasN; i++)
			{
				var pl;
				if(i < jugadoresN)
				{
					var jug = new jugador(coloreF[i], controles[i]);
					jugadores.push(jug);
					document.getElementById("datos").innerHTML += "<p style='color: "+coloreF[i]+"'> Control jugador " + jug.id + ": " + controlesNombre[i] + "</p>";
					pl = new bola("white", jug);
					jug.bolas++;
				}else{
					if(j < jugadoresN && jugadores[j].bolas < bolasXjugador)
					{
						pl = new bola("white", jugadores[j]);
						jugadores[j].bolas++;
						if(jugadores[j].bolas == bolasXjugador)
							j++;
					}else
						pl = new bola("white", null);
				}
				
				if(planetas.length >= (modo==2?bolasN+1:bolasN))
				{
					var pI = Math.floor(Math.random() * (p_copia.length-1));
					pl.planeta = p_copia[ pI ];
					p_copia.splice(pI, 1);
				}else{
					var pI = Math.floor(Math.random() * (planetas.length-1));
					pl.planeta = planetas[ pI ];
				}
				
				var sig = Math.pow(-1, Math.floor(Math.random() * 10)); //Para el signo
				pl.vR = sig * 3*Math.PI/4 +  sig * Math.PI/2 * Math.random();
				pl.ang = Math.random() * 10;
				bolas.push(pl);
			}
	}
	if(genAgujeros)
	{
		for(i=0;i < maxAgujeros;i++)
			generarAgujero(10,50,100);
	}	
	inicio_partida = Date.now();
	gamefin = false;
	game();
};

var game = function()
//Función de actualización del juego.
{
	var now = Date.now();
	var delta = now - then;
	
    if(delta == 0)
    {
        delta = 1;
        console.log("Fallo en la medición de tiempos.\n");
    }
    update(delta / 1000);
    render();

	if(duracion > 0 && modo != 0 && now - inicio_partida > duracion * 60000) //Fin de partida en modo no clásico
		finalizar(null);

	for(var i in notas)
	{
		if(notas[i].t < now)
		{
			notas.splice(i, 1);
			i-=1;
		}
	}
    then = now;
	// Request to do this again ASAP
	if(!gamefin) requestAnimationFrame(game);
};

var update = function(secs)
{
	if(secs == 0) return;
	var pos = new Array();
	//Cada jugador
	for(var i in bolas)
	{
		var pl = bolas[i];
		var r = Math.random();
		
		if(!pl.vivo) continue;
		
		pl.anterior_pos = {"x": pl.x, "y": pl.y};
		var c = Math.floor( (pl.vidas-0.3) / (pl.maxvidas-0.3) * 255);
		pl.color = "rgb("+c+","+c+","+c+")";
		
		if(pl.planeta)
		{
			if(pl.vR == 0) pl.vR +=  r * pl.incVr * secs;
			
			pl.ang += (pl.vR * secs);
			if(Math.abs(pl.ang) > 2 * Math.PI)
				pl.ang -= 2 * Math.PI * signo(pl.ang);
			pl.x = pl.planeta.x + pl.planeta.rg * Math.cos(pl.ang);
			pl.y = pl.planeta.y + pl.planeta.rg * Math.sin(pl.ang);
			
			//Sumar / restar velocidad
			var vant = Math.abs(pl.vR * pl.planeta.rg);
			if( Math.abs(pl.vR / pl.planeta.rg) < pl.maxV) pl.vR += r * pl.incVr * secs * signo(pl.vR);
			if( Math.abs(pl.vR / pl.planeta.rg) > pl.maxV/2) pl.vR -= r * pl.incVr * secs * signo(pl.vR) * 0.9;
			if( Math.abs(pl.vR / pl.planeta.rg) > pl.maxV*1.5) pl.vR *= 0.8;

			/*if(Math.abs(pl.vR * pl.planeta.rg) -  vant > 0) //Aumento la v
				pl.color = "#00FF00";
			else if(Math.abs(pl.vR * pl.planeta.rg) -  vant < 0) //Aumento la v
				pl.color = "#FF0000";
			else
				pl.color = "#FFFFFF";*/
			
			if(modo == 2 && pl.jugador && pl.planeta.centro)
			{
				if(pl.planeta.ultimo) pl.planeta.ultimo.ultimo = false;
				pl.jugador.ultimo = true;
				pl.planeta.ultimo = pl.jugador;

				pl.jugador.tiempo += secs;
				if(pl.jugador.tiempo > pl.planeta.mayor_t)
				{
					pl.planeta.mayor_t = pl.jugador.tiempo;
					pl.planeta.mayor_t_j = pl.jugador;
				}
			}
			
			//Comprobación colisiones
			if(!pl.invisible)
			{
				if(pos.length > 0)
					for(var j in pos)
                    {
                        if(menorDistanciaPS(pl.anterior_pos, pl, pos[j]) < 2 * pl.r)
						{
							sonidos.pong.currentTime = 0;
							sonidos.pong.play();
							if(pl.vR * bolas[pos[j].id].vR <= 0) //Choque frontal
							{
								var pvR = Math.abs(pl.vR);
								var bvR = Math.abs(bolas[pos[j].id].vR);
								pl.vR *= -1;
								bolas[pos[j].id].vR *= -1;
								
								if( pvR <= bvR && !pl.invencible) //pl más lento
								{
									pl.vR *= 1.35;
									bolas[pos[j].id].vR *= 0.85;
									pl.salirOrb();
								}
								if( pvR >= bvR && !bolas[pos[j].id].invencible) //pl más rápido
								{
									pl.vR *= 0.85;
									bolas[pos[j].id].vR *= 1.35;
									bolas[pos[j].id].salirOrb();
								}
							}else{ //Choque por detrás
								if(Math.abs(pl.vR) < Math.abs(bolas[pos[j].id].vR))
								{
									pl.vR = bolas[pos[j].id].vR;
									bolas[pos[j].id].vR = pl.vR * 0.85;
									if(!pl.invencible) pl.salirOrb();
								}
								else
								{
									bolas[pos[j].id].vR = pl.vR;
									pl.vR = bolas[pos[j].id].vR * 0.85;
									if(!bolas[pos[j].id].invencible) bolas[pos[j].id].salirOrb();
								}
							}
							if(pl.invencible)
								bolas[pos[j].id].salirOrb();
							if(bolas[pos[j].id].invencible)
								pl.salirOrb();
							break;
						}
                    }
				pos.push({x: pl.x, y: pl.y, id: i});
			}
		}else{
			//No está en órbita
			pl.x += pl.v.x * secs;
			pl.y += pl.v.y * secs;
            
			var algun=false;
			for(var i in agujeros)
			{
				var ag = agujeros[i];
				var d = menorDistanciaPS(pl.anterior_pos, pl, ag);
				if(!agujerosInofensivos && d <= ag.c)
                {
                    if(!pl.noTragar)
                    {
                        if(pl.transportado)
                        {
                            pl.transportado = false;
                            var j;
                            do
                            {
                            j = Math.round(Math.random()*(agujeros.length-1));
                            }while(agujeros.length > 1 && j==i);
                            pl.x = agujeros[j].x;
                            pl.y = agujeros[j].y;
                            pl.noTragar = true;
                        }else
                            pl.matar("Agujero negro.", true);
                    }
                    algun = true;
                }
                else if(d <= ag.r)
				{
                    
                    if(!pl.noTragar)
                    {
                        var v = {'x': (ag.x - pl.x), 'y': (ag.y - pl.y)};
                        v.x *= secs * ag.a / moduloVector(v.x, v.y);
                        v.y *= secs * ag.a / moduloVector(v.x, v.y);
                        pl.v.x += v.x;
                        pl.v.y += v.y;
                    }
                    algun = true;
				}
                if(algun)
                    break;
			}
			if(!algun && pl.noTragar)
                pl.noTragar = false;
            
			if(!pl) continue; //Siguiente jugador
			
			if(pl.x < 0 || pl.x > scr.w)
			{
				pl.v.x *= -1;
				pl.x += pl.v.x * secs;
				sonidos.pong2.currentTime = 0;
				sonidos.pong2.play();
				pl.matar("Fuera del campo.");
			}
			if(pl.y < 0 || pl.y > scr.h)
			{
				sonidos.pong2.currentTime = 0;
				sonidos.pong2.play();
				pl.v.y *= -1;
				pl.y += pl.v.y * secs;
				pl.matar("Fuera del campo.");
			}
		}

		var planet = enOrbita(pl);
		if( (!pl.jugador || !keysDown[pl.jugador.controlId]) && planet && !pl.planeta) //Cuando toca por primera vez una órbita
		{
			pl.planeta = planet;
			var dx = pl.x - planet.x;
			var dy = pl.y - planet.y;
            pl.ang = Math.atan2(dy, dx);
			
			pl.vR = Math.sqrt(Math.pow(pl.v.x, 2)+Math.pow(pl.v.y, 2)) / planet.rg;
			//Ajustar signo de la velocidad angular, pls.
			var sig_ang;
			dx = pl.x + pl.v.x * secs - planet.x;
			dy = pl.y + pl.v.y * secs - planet.y;
			sig_ang = Math.atan2(dy, dx);
            
			if(sig_ang < pl.ang) pl.vR *= -1;

			//Sonido de entrar
			sonidos.entrada.currentTime = 0;
			sonidos.entrada.play();
		}
		
		for(var i in asteroides)
		{
			var as = asteroides[i];
			if( moduloVector(pl.x - as.x, pl.y - as.y) < pl.r + 5)
			//Coger el asteroide
			{
				var malosTipos = [2,3,5,6,7];
				while(pl.fortuna && malosTipos.indexOf(as.tipo) != -1)
					as.tipo = Math.round(Math.random() * (ast_tipos.length - 1) );
				switch(as.tipo)
				{
					case 0:
						pl.invencible = true;
						pl.invencibleTime = as.duracion;
						break;
					case 1:
						pl.vR *= 1.75;
						break;
					case 2:
						pl.vR *= 0.5;
						break;
					case 3:
						pl.salirOrb();
						break;
					case 4:
						pl.invisible = true;
						pl.invisibleTime = as.duracion;
						break;
					case 5:
						break;
					case 6:
						pl.vR *= -1;
						break;
					case 7:
						pl.fortuna = true;
						pl.fortunaTime = as.duracion * 10;
						break;
					case 8:
						pl.gravedad = true;
						pl.gravedadTime = as.duracion * 5;
						break;
					case 9:
						pl.vR *= 1.5;
						break;
                    case 10:
                        pl.salvado = true;
                        break;
                    case 11:
                        pl.transportado = true;
                        break;
					default:
						console.log("Asteroide tipo [", as.tipo, "] DESCONOCIDO.", as);
				}
				
				if(pl.jugador)
					nota(ast_tipos[as.tipo][0], pl.jugador.color);
				else
					nota(ast_tipos[as.tipo][0], "gray");
				
				asteroides.splice(i, 1);
				i-=1;
			}
		}
		
		if(pl.invencible)
		{
			pl.invencibleTime -=  secs * 1000;
			if(pl.invencibleTime < 0)
				pl.invencible = false;
		}
		if(pl.invisible)
		{
			pl.invisibleTime -= secs*1000;
			if(pl.invisibleTime < 0)
				pl.invisible = false;
		}
		if(pl.fortuna)
		{
			pl.fortunaTime -= secs*1000;
			if(pl.fortunaTime < 0)
				pl.fortuna = false;
		}
		if(pl.gravedad)
		{
			pl.gravedadTime -= secs*1000;
			if(pl.gravedadTime < 0)
				pl.gravedad = false;
		}
	}
	//Fin cada jugador
	
	var rand = Math.random() * 1000;
	if(rand < 1)
	{
		var i = Math.floor(Math.random() * (planetas.length-1));
		if(!planetas[i].nodisponible && !planetas[i].centro)
		{
			planetasND.push(planetas[i]);
			planetas[i].nodisponible = 500;
		}
		
		if(rand < 0.5)
			generarAsteroide();
	}
	
	for(var i in planetasRV)
	{
		var plan = planetasRV[i];
		if(plan.crece)
			plan.rv += 0.001;
		else
			plan.rv -= 0.001;
		if(plan.rv <= 0.75){ plan.rv = 0.75; plan.crece = true;}
		if(plan.rv >= 1){ plan.rv = 1; plan.crece = false;}
		
		plan.rg = plan.rr * plan.rv;
	}
	
	for(var i in planetasND)
	{
		planetasND[i].nodisponible -= 1; //Volverá a estar disponible tarde o temprano
		if(planetasND[i].nodisponible < 1)
		{
			planetasND[i].nodisponible = 0;
			planetasND.splice(i, 0); i-=1;
		}
	}
};

function finalizar(vividor)
{
	switch(modo)
	{
		case 0: //Clásico
			nota("Ganador jugador " + vividor.id, vividor.color);
			break;
		case 1: //Muertes
			var menor = 0;
            var empate = true;
			notas.splice(0, notas.length);
			for(i=0; i<jugadores.length; i++)
			{
				var mins = Math.floor(jugadores[i].ultimaMuerte / 60000);
				var secs = Math.floor((jugadores[i].ultimaMuerte - mins*60000)/1000);
				var mils = Math.floor((jugadores[i].ultimaMuerte - mins*60000 - secs*1000));
				if(mils < 100) mils = "0"+mils.toString();
				if(mils < 10) mils = "0"+mils.toString();				
				
				nota("Jugador " + (jugadores[i].id) + ": " + jugadores[i].muertes + " muertes. Última ("+mins+"' "+secs+"\" "+mils+")", jugadores[i].color);
                if(empate && jugadores[i].muertes != 0)
                    empate = false;
				if(jugadores[i].muertes < jugadores[menor].muertes || (jugadores[i].muertes == jugadores[menor].muertes && jugadores[i].ultimaMuerte > jugadores[menor].ultimaMuerte ))
					menor = i;
			}
            if(!empate)
			    nota("Ganador jugador " + jugadores[menor].id, jugadores[menor].color);
			else
                nota("Empate", "gray");
            break;
		case 2:	
			var mayor = 0;
			notas.splice(0, notas.length);
			for(i=0; i<jugadores.length; i++)
			{
				var not = "Jugador " + (jugadores[i].id) + ": " + Math.round(jugadores[i].tiempo*100)/100 + " segundos.";
				if(jugadores[i].ultimo)
					not += " (Ultimo)";
				nota(not, jugadores[i].color);
				if(jugadores[i].tiempo > jugadores[mayor].tiempo || (jugadores[i].tiempo == jugadores[mayor].tiempo && jugadores[i].ultimo ))
					mayor = i;
			}
			nota("Ganador jugador " + jugadores[mayor].id, jugadores[mayor].color);
			break;
	}
	setTimeout(function() {
		gamefin = true;
		sonidos.claxon.currentTime = 0;
		sonidos.claxon.play();
	}, 100);
}

if(document.location.hash.substring(1) == "noinit") iniciar();