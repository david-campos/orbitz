var imgAgujero = new Image();

var render = function()
{
    ctx.clearRect(0,0,canvas.width / escala.w,canvas.height / escala.h);

    if(escala.update) {
        escala.update = false;
        ctx.scale(escala.w, escala.h);
    }

	//Planetas
	for(var i in planetas)
		dibujarPlaneta(planetas[i]);

	//Asteroides
	for(var i in asteroides)
	{
		var as = asteroides[i];
		var grd = ctx.createRadialGradient(as.x,as.y,0,as.x,as.y,4);
		ctx.beginPath();
		
		grd.addColorStop(0,"black");
		grd.addColorStop(1,"white");

		ctx.arc(as.x, as.y, 5, 0, 2*Math.PI);
		ctx.fillStyle = grd;
		ctx.fill();
		ctx.closePath();
	}
	
	//Agujeros
	for(var i in agujeros)
	{
		var ag = agujeros[i];
		ctx.save();
		ctx.translate(ag.x, ag.y);
		ctx.rotate(ag.ang);
		ag.ang = (ag.ang + 0.002)%(2*Math.PI);
		ctx.drawImage(imgAgujero, -ag.r, -ag.r, 2*ag.r, 2*ag.r);
		ctx.restore();
	}
	
	//bolas
	for(var i in bolas)
	{
		var pl = bolas[i];
		
		if(!pl.vivo) continue;

		if(pl.gravedad)
		{
			var grd = ctx.createRadialGradient(pl.x,pl.y,0,pl.x,pl.y,pl.r * 2);	
			grd.addColorStop(0,"rgba(182, 247, 77, 0.4)");
			grd.addColorStop(1,"rgba(182, 247, 77, 0.1)");
			
			ctx.beginPath();
			ctx.arc(pl.x, pl.y, pl.r * 2, 0, 2*Math.PI);
			ctx.fillStyle = grd;
			ctx.fill();
			ctx.closePath();
		}
		
		var grd = ctx.createRadialGradient(pl.x,pl.y,0,pl.x,pl.y,pl.r - 1);
		ctx.beginPath();
		
        if(pl.salvado)
            grd.addColorStop(0,"#ffff00");
        else
			grd.addColorStop(0,pl.color);
		
		if(pl.invisible)
			grd.addColorStop(0.5, "rgba(0,0,0,0)");
		
		if(pl.jugador)
			grd.addColorStop(1, pl.jugador.color);
		else
			grd.addColorStop(1, "gray");
			
		var alpha;
		if(pl.fortuna)
		{
			alpha = Math.abs(2000 - (pl.fortunaTime % 4000))/2000;
			if(!pl.invencible) ctx.shadowColor = "rgba(0, 255, 0, "+alpha+")";
			else ctx.shadowColor = "green";
		}
		if(pl.invencible && (!pl.fortuna || alpha <= 0.5) )
			ctx.shadowColor = "white";
			
		if(pl.invencible || pl.fortuna)
			ctx.shadowBlur = 10;
		
        if(!pl.planeta && pl.transportado)
        {
            var ang = Math.atan2(pl.v.y, pl.v.x)+Math.PI;
            
            ctx.moveTo(pl.x, pl.y);
            ctx.lineTo(pl.x + 1.5 * pl.r * Math.cos(ang+Math.PI/4), pl.y + 1.5 * pl.r * Math.sin(ang+Math.PI/4));
            ctx.lineTo(pl.x + 1.5 * pl.r * Math.cos(ang+Math.PI), pl.y + 1.5 * pl.r * Math.sin(ang+Math.PI));
            ctx.lineTo(pl.x + 1.5 * pl.r * Math.cos(ang-Math.PI/4), pl.y + 1.5 * pl.r * Math.sin(ang-Math.PI/4));
            ctx.fillStyle = grd;
            ctx.fill();
        }
        else
        {
            ctx.arc(pl.x, pl.y, pl.r, 0, 2*Math.PI);
            ctx.fillStyle = grd;
            ctx.fill();
        }
        ctx.closePath();
		ctx.shadowBlur = 0;
	}
	
	//Notas
	ctx.font="bold 15px Verdana";
	for(var i in notas)
	{
		// Create gradient
		var gradient=ctx.createLinearGradient(0,0,200,0);
		gradient.addColorStop("0.25",notas[i].color);
		gradient.addColorStop("0.75","white");
		// Fill with gradient
		ctx.fillStyle=gradient;
		ctx.fillText(notas[i].mensaje, 20, 20 + i * 20);
	}
	
	//Reloj
	if(modo != 0 && duracion > 0)
	{
		// Math.round(jugadores[i].ultimaMuerte/60000) mins
		var restante =  Math.round(duracion*30 - (Date.now() - inicio_partida)/2000);
               
		if(restante < 0 || restante > 9) return;
        
        var rojo = duracion*60000 - (Date.now() - inicio_partida); //Restante en milisegundos
        rojo = rojo%2000; //Cíclico cada 2 segundos
        rojo = (Math.sin(rojo/1000*Math.PI+Math.PI/4)+1)/2;
        
        for(i=1;i<=restante;i++)
        {
		    ctx.beginPath();
		    ctx.rect(scr.w / 2 - 50 + i*2 + (i-1)*9, scr.h - 28, 9, 18);
		    ctx.fillStyle = "rgba(200,0,0,"+rojo+")";
		    ctx.fill();
		    ctx.closePath();
        }
	}
};

function dibujarPlaneta(p)
{
	//Los planetas tambien tienen gradiente
	var grd = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.rg);
	
	if(p.centro){
		if(p.mayor_t_j != null)
			grd.addColorStop(0.3,p.mayor_t_j.color);
		else
			grd.addColorStop(0,"rgba(80, 200, 80, 0.4)");
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
	
	//Centro del planeta
	if(plt_imgs[p.n_imagen].ready)
	{
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.rotate(p.ang);
		p.ang = (p.ang + p.vel)%(2*Math.PI);
		ctx.drawImage(plt_imgs[p.n_imagen], -((0.5 + p.r) | 0), -((0.5 + p.r) | 0), 2*((0.5 + p.r) | 0), 2*((0.5 + p.r) | 0));
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

var debugPunto = function(x, y)
{
    ctx.beginPath();
		
		var grd = ctx.createRadialGradient(x,y,0,x,y,4);
		grd.addColorStop(0,"#00ff00");
		grd.addColorStop(1,"#ff00ff");

		ctx.arc(x, y, 5, 0, 2*Math.PI);
		ctx.fillStyle = grd;
		ctx.fill();
		ctx.closePath();
}