@if exist "deploy\" rd /S /Q deploy
mkdir deploy
@echo (function(){ > deploy\theScript.js
cat globals.js sonidos.js bola.js elementos.js scripts.js game.js generacion.js input.js log.js renderizado.js main.js menu.js >> deploy\theScript.js
@echo })(); >> deploy\theScript.js
cat css\cyborg.css css\estilos.css css\fonts.css > deploy\theCss.css
xcopy /Y /I index.html deploy
xcopy /Y /I favicon.ico deploy
xcopy /S /I /Y css\fonts deploy\fonts
xcopy /S /I /Y img deploy\img
xcopy /S /I /Y snd deploy\snd
@echo DONE! :D