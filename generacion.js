//Generacion nivel
var globf_generarPlanetaRandom = function(rmin, rmax, juego) {
	var vale, max;
	var x, y, r, rg;
	
	max = Date.now() + 1000; //1 segundo para generar de máximo
	do {
		r = (Math.random() * 10000) % (rmax - rmin) + rmin;
		rg = r * 2.5;

		vale = true;
		x = (Math.random() * 10000) % (MAP.w - 2*rg) + rg;
		y = (Math.random() * 10000) % (MAP.h - 2*rg) + rg;
		
		for(var i in juego.planetas) {
			var otroP = juego.planetas[i];
			if( moduloVector(otroP.x - x, otroP.y - y) < otroP.rg + rg + 2*RADIO_BOLAS)
			{
				vale = false;
				break;
			}
		}
	} while(!vale && Date.now() < max);
	
	if(!vale) return null;
	return new Planeta(x, y, r, rg);
};
var globf_generarAgujeroRandom = function(c, rmin, rmax, juego) {
	var vale, max;
	var x, y, r;

	vale = false;

	max = Date.now() + 1000; //1 segundo para generar de máximo
	do {
		vale = true;
		r = Math.round(Math.random() * (rmax - rmin)) + rmin;
		
		x = Math.round(Math.random() * (MAP.w - 4*r)) + r;
		y = Math.round(Math.random() * (MAP.h - 4*r)) + r;

		for(var i in juego.planetas) {
			var otroP = juego.planetas[i];
			if( moduloVector(otroP.x - x, otroP.y - y) < otroP.rg + r + 2*RADIO_BOLAS) {
				vale = false;
				break;
			}
		}
		if(vale)
			for(i in juego.agujeros) {
				var otroA = juego.agujeros[i];
				if(moduloVector(otroA.x - x, otroA.y - y) < otroA.r + r + 2*RADIO_BOLAS) {
					vale = false;
					break;
				}
			}
	}while(!vale && Date.now() < max);
	
	if(!vale) return null;
	
	var a = Math.random() * (r / rmax) * 1500 + 500;
	return new Agujero(x, y, r, c, a);
};

//Generacion ingame
var globf_generarAsteroide = function(juego)  {
	var p = Math.floor(Math.random() * juego.planetas.length);
	var ang = Math.floor(Math.random() * 2.5 * Math.PI);
	return new Asteroide(
		juego.planetas[p].x + juego.planetas[p].rg * Math.cos(ang),
		juego.planetas[p].y + juego.planetas[p].rg * Math.sin(ang));
};