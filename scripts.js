function enOrbita(pl)
// Comprueba
{
	for(var i in planetas)
	{
		if(planetas.hasOwnProperty(i)) {
            var p = planetas[i];
            if ((p.nodisponible && !pl.gravedad) || pl.planetaAnt === p) continue;

            //Vamos a obtener la menor distancia del segmento (pl.anterior_pos pl.pos) al centro del planeta
            var d = menorDistanciaPS(pl.anterior_pos, pl, p);
            if (d <= p.rg + radioJug && d >= p.rg - radioJug)
                return p;
        }
	}
	return null;
}
function menorDistanciaPS(A, B, C)
// Menor distancia del segmento AB al punto C
{
    if(A.x === B.x && A.y === B.y) {
        // A y B son el mismo punto, devolvemos A->C
        return moduloVector(A.x - C.x, A.y - C.y);
    } else {
        var uN = (C.x-A.x)*(B.x-A.x)+(C.y-A.y)*(B.y-A.y); //Numerador
        var uD = Math.pow((B.x - A.x),2)+Math.pow((B.y - A.y), 2); //Denominador
        var u = uN / uD;
        //Si u < 0, d = A->C; u > 1, d = B->C; else d = P->C (Calcular P)

        if (u < 0)
            return moduloVector(A.x - C.x, A.y - C.y);
        else if (u > 1)
            return moduloVector(B.x - C.x, B.y - C.y);
        else {
            var P = [A.x + u * (B.x - A.x), A.y + u * (B.y - A.y)];
            return moduloVector(P[0] - C.x, P[1] - C.y);
        }
    }
}
function signo(n)
{
	if(n < 0) return -1;
	else return 1;
}

function moduloVector(x, y)
{
	return Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) );
}

function nota(mensaje, color)
{
	var miNota = {};
	miNota.mensaje = mensaje;
	miNota.t = Date.now() + 5000;
	miNota.color = color;
	
	notas.push(miNota);
}