//Generacion nivel
var generarPlanetaRandom = function(rmin, rmax)
{
	var vale, max;
	var x, y, r, rg;
	
	max = Date.now() + 1000; //1 segundo para generar de máximo
	do
	{
		r = (Math.random() * 10000) % (rmax - rmin) + rmin;
		rg = r * 2.5;
	
		vale = true;
		x = (Math.random() * 10000) % (scr.w - 2*rg) + rg;
		y = (Math.random() * 10000) % (scr.h - 2*rg) + rg;
		
		for(var i in planetas)
		{
			var otroP = planetas[i];
			if( moduloVector(otroP.x - x, otroP.y - y) < otroP.rg + rg + 2*radioJug)
			{
				vale = false;
				break;
			}
		}
	}while(!vale && Date.now() < max);
	
	if(!vale) return false;
	
	var miP = new planeta(x, y, r, rg);
	
	planetas.push(miP);
	
	return true;
};
var generarAgujero = function(c, rmin, rmax)
{
	var vale, max;
	var x, y, r;

	vale = false;

	max = Date.now() + 1000; //1 segundo para generar de máximo
	do
	{
		vale = true;
		r = Math.round(Math.random() * (rmax - rmin)) + rmin;
		
		x = Math.round(Math.random() * (0.50 * (scr.w - 2*r))) + r + scr.w * 0.25;
		y = Math.round(Math.random() * (0.50 * (scr.h - 2*r))) + r + scr.h * 0.25;

		for(var i in planetas)
		{
			var otroP = planetas[i];
			if( moduloVector(otroP.x - x, otroP.y - y) < otroP.rg + r + 2*radioJug)
			{
				vale = false;
				break;
			}
		}
		if(vale)
			for(var i in agujeros)
			{
				var otroA = agujeros[i];
				if(moduloVector(otroA.x - x, otroA.y - y) < otroA.r + r + 2*radioJug)
				{
					vale = false;
					break;
				}
			}
	}while(!vale && Date.now() < max);
	
	if(!vale) return false;
	
	var a = Math.random() * (r / rmax) * 1500 + 500;
	
	var miA = new agujero(x, y, r, c, a);
	agujeros.push(miA);
	
	return true;
};

//Generacion ingame
var generarAsteroide = function()
{
	var p = Math.floor(Math.random() * planetas.length);
	var ang = Math.floor(Math.random() * 2.5 * Math.PI);
	var miAst = new asteroide(planetas[p].x + planetas[p].rg * Math.cos(ang), planetas[p].y + planetas[p].rg * Math.sin(ang));
	asteroides.push(miAst);
};