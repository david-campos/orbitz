// Keyboard
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
	
	if(e.keyCode == 27)
		restart();
	else if(e.keyCode == 80)
		if(!sonidos.fondo.paused) sonidos.fondo.pause();
		else sonidos.fondo.play();
	else{	
		for(var i in bolas)
		{
			var pl = bolas[i];
			if(pl.jugador && e.keyCode == pl.jugador.controlId)
				pl.salirOrb();
		}
	}
	
	if(gamefin) return;
	var evt = e ? e:window.event;
	if (evt.preventDefault) evt.preventDefault();
	evt.returnValue = false;
	return false;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);