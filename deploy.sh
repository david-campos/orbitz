#!/bin/bash

# Go to the directory where the script is
cd "$(dirname "$0")"

# Remove folder if it exists
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
sed -e '/<!-- \/REEMPLAZAR -->/r auxDeploy' -e '/<!-- REEMPLAZAR -->/,/<!-- \/REEMPLAZAR -->/d' deploy/index.html > deploy/index_tmp
mv deploy/index_tmp deploy/index.html

echo "Uglifying..."
uglifyjs deploy/theScript.js  --compress --mangle > deploy/theScript_tmp
mv deploy/theScript_tmp deploy/theScript.js

# Deploy to the web?
if [ "$1" == "-toWeb" ]; then
	echo "Deploy to web..."
	rm -rf ../david-campos.github.io/*
	cp -rf deploy/* ../david-campos.github.io/
	cd ../david-campos.github.io/
	git add --all
	git commit
	git push
fi

echo "Done :)!"
