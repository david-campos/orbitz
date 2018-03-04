// Keyboard
var keysDown = {};
var fullScreen = false;

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;

	if(e.keyCode === 77) {
        // Tecla M = muteBtn
        toggleMute();
    } else if(e.keyCode === 82) {
	    if(juego && juego.iniciado &&
            !juego.pausado && !juego.apagado) {
	        restart();
        }
    } else if(e.keyCode === 70) {
	    // Tecla F = fullscreen
        if(!fullScreen) {
            requestFullscreen(document.body);
            fullScreen = true;
        } else {
            exitFullscreen();
            fullScreen = false;
        }
    } else if(e.keyCode === 27) {
	   // Esc
	    if(fullScreen) exitFullscreen();
    } else if(e.keyCode === 76) {
	    // L
        glob_debugMode = !glob_debugMode;
    } else if(e.keyCode === 116 || e.keyCode === 122) {
	    // F5, F11
        return true;
    }

	if(!juego || (juego.finalizado || juego.pausado || !juego.iniciado)) return true;
	var evt = e ? e:window.event;
	if (evt.preventDefault) evt.preventDefault();
	evt.returnValue = false;
	return false;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
	if(juego) {
	    juego.puedeRepetirSonidos(e.keyCode);
    }
}, false);

var requestFullscreen = function (ele) {
    if (ele.requestFullscreen) {
        ele.requestFullscreen();
    } else if (ele.webkitRequestFullscreen) {
        ele.webkitRequestFullscreen();
    } else if (ele.mozRequestFullScreen) {
        ele.mozRequestFullScreen();
    } else if (ele.msRequestFullscreen) {
        ele.msRequestFullscreen();
    } else {
        console.log('Fullscreen API is not supported.');
    }
};

var exitFullscreen = function () {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else {
        console.log('Fullscreen API is not supported.');
    }
};