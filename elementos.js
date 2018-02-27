var gamefin = true;

// Objetos de juego
var bolas = new Array();
var jugadores = new Array();
const radioJug = 10;

function jugador(color, controlId)
{
	this.bolas = 0;
	this.muertes = 0;
	this.tiempo = 0;
	this.color = color;
	this.controlId = controlId;
	this.ultimaMuerte = 0;
	this.id = jugador.ultId++;
}
jugador.ultId = 1;

function bola(color, jug)
{
	this.v = new Object();
	this.v.x = 0; //Velocidad en px/s (solo efectiva fuera de orbita)
	this.v.y = 0;
	this.vR = Math.PI; //Velocidad angular en rad/s (solo efectiva dentro de orbita)
	this.maxV = 0.15;
	this.incVr = Math.PI / 8 ; //Aumento de velocidad rad/(s^2)

	this.ang = 0; //Angulo girado.
	this.x = 0; this.y = 0; this.anterior_pos = [0,0];
	this.r = radioJug;
	this.planeta = null;
	this.planetaAnt = null;
	
	this.vivo = true;
	this.maxvidas = 4;
	this.vidas = this.maxvidas;
	this.color = color;
	
	this.jugador = jug;
	
	this.matar = function(mensaje, fin)
	{
		if(bolas.length < 2 || (modo == 2 && this.jugador)) return;
        if(this.salvado)
        {
            this.salvado = false;
            return;
        }
		this.vidas--;
		if(!fin && this.vidas > 0)
		{
			if(this.jugador)
				nota(this.vidas + " vidas restantes", this.jugador.color);
			else
				nota(this.vidas + " vidas restantes", "gray");
			this.planetaAnt = null;
			return;
		}
		this.vivo = false;
		sonidos.muerte.currentTime = 0;
		sonidos.muerte.play();
		
		//Si tiene jugador lo administramos para buscarle otra a ser posible
		if(this.jugador)
		{
			nota(mensaje, this.jugador.color);
			this.jugador.bolas--;
			this.jugador.muertes++;
			this.jugador.ultimaMuerte = Date.now() - inicio_partida;

			document.getElementById("datos").innerHTML = "";
			var buscando = true;
			for(var i in bolas)
			{
				if(i < jugadores.length && bolasN > jugadores.length)
					document.getElementById("datos").innerHTML += "<p style='color: "+jugadores[i].color+"'> Control jugador " + jugadores[i].id + ": " + controlesNombre[i] + " <br>&nbsp;&nbsp;" + jugadores[i].muertes + " muertes. </p>";
				if(buscando && !bolas[i].jugador)
				{
					bolas[i].jugador = this.jugador;
					this.jugador.bolas++;
					buscando = false;
				}
				if(!buscando && bolasN == jugadores.length)
					break;
			}
			//Adiós bola
			bolas.splice(bolas.indexOf(this), 1);
		}
		else
		{
			//Adiós bola
			bolas.splice(bolas.indexOf(this), 1);
			return; //La muerte de una bola sin jugador no puede causar el final.
		}

		var viven = 0;
		var vividor = null;
		for(i in jugadores)
		{
			if(jugadores[i].bolas > 0)
			{
				vividor = jugadores[i];
				viven++;
				if(viven > 1)
					return;
			}
		}
		
		//Si llega hasta aquí, la partida ha acabado...
		finalizar(vividor);
	}
	this.salirOrb = function()
	{
		if(!this.planeta) return;
		var v = this.vR * this.planeta.rg;
		var u = {x: this.x - this.planeta.x, y: this.y - this.planeta.y};
		var aux = u.x;
		u.x = u.y;
		u.y = aux;
		u.x = -u.x;
		
		var mu = moduloVector(u.x, u.y);
		u.x = u.x / mu;
		u.y = u.y / mu;
		
		this.v.x = u.x * v;
		this.v.y = u.y * v;
		this.planetaAnt = this.planeta;
		this.planeta = null;
		sonidos.cambio.currentTime = 0
		sonidos.cambio.play();
	}
}

var asteroides = new Array();
var ast_tipos = [["Invencible", 2],
                 ["Speed ^^", 3],
                 ["Speed v", 4],
                 ["Fuera de la órbita!", 5],
                 ["Invisible", 6],
                 ["Asteroide inútil", 7],
                 ["Rebote!", 5],
                 ["Afortunado", 3],
                 ["Gravedad propia", 3],
                 ["Speed ^", 6],
                 ["Salvavidas", 7],
                 ["Transporte", 6]];
var ast_prob_t = 0;
for(i in ast_tipos)
{
    var p = ast_tipos[i][1];
    ast_tipos[i][1] = ast_prob_t;
    ast_prob_t += p;
}

function asteroide(x, y)
{
	this.x = x;
	this.y = y;
	var r = Math.random();
	this.duracion = 2000 + (r * 8000);
	var t = Math.round(r * (ast_prob_t-1));
    for(i in ast_tipos)
        if(ast_tipos[i][1] > t)
        {
            this.tipo = parseInt(i-1);
            break;
        }
    if(!this.tipo)
        this.tipo = parseInt(i-1);
}

var planetas = new Array();
var planetasND = new Array();
var planetasRV = new Array();
var plt_imgs_max = 17;
var plt_imgs = new Object();
function planeta(x, y, r, rg, centro)
{
	this.x = x;
	this.y = y;
	this.r = r;
	this.centro = centro;
	if(this.centro)
	{
		this.mayor_t = 0;
		this.mayor_t_j = null;
	}
	var ran = Math.random();
	this.n_imagen = Math.round( ran * (plt_imgs_max-1));
	
	this.ang = ran * 10;
	this.vel = (0.001 + ran * 0.009) * Math.pow(-1, Math.floor(ran * 10));
	
	//Si la imagen no se cargó para otro planeta, se carga.
	if(! plt_imgs[this.n_imagen] )
	{
		var nImagen = new Image();
		nImagen.ready = false;
		nImagen.src = "img/planeta_"+this.n_imagen+".png";
		nImagen.onload = function () {
			this.ready = true;
		};
		plt_imgs[this.n_imagen] = nImagen;
	}
	
	this.rg = rg;
	this.nodisponible = 0;
	this.radioVariable = !centro && ran * 1000  < 100;
	if(this.radioVariable)
	{
		this.rr = rg;
		this.rv = 1.0;
		this.crece = false;
		planetasRV.push(this);
	}
}

var agujeros = new Array();
function agujero(x, y, r, c, a)
{
	this.x = x;
	this.y = y;
	this.r = r; //Radio (en el que absorbe)
	this.c = c; //Centro (en el que pierdes)
	this.a = a; //Aceleración que imprime hacia él (pixels/segundo^2)
	this.ang = 0; //Angulo para la rotacion (grafica)
}

var notas = new Array();