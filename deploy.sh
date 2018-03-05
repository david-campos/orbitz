#!/bin/bash

if [ ! -d deploy ]
then
	mkdir deploy
fi

rm -rf deploy/*

echo "Copiando..."

printf "(function() {\n" > deploy/theScript.js
cat *.js >> deploy/theScript.js
printf "\n})();" >> deploy/theScript.js

cat css/cyborg.css css/estilos.css > deploy/theStyle.css
cp -rf img deploy/img
cp -rf snd deploy/snd
cp favicon.ico deploy/favicon.ico
cp index.html deploy/index.html

echo "Corrigiendo index.html..."
sed -e '/<!-- \/REEMPLAZAR -->/r auxDeploy' -e '/<!-- REEMPLAZAR -->/,/<!-- \/REEMPLAZAR -->/d' deploy/index.html > deploy/index2.html
mv deploy/index2.html deploy/index.html

echo "Uglifying..."
# uglifyjs deploy/theScript.js  --compress --mangle > deploy/theScript.js

echo "Done :)!"
