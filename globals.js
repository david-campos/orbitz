// CONFIG
const MODOS = {CLASICO: "Clásico", INSTINTO: "Instinto", CENTRO: "Centro"}; // Nombres de los modos de juego
/** @type {number} Radio de las bolas de juego*/
const RADIO_BOLAS = 10;
/** @type {number} Radio mínimo de los planetas generados */
const RADIO_PLANETAS_MIN = 30;
/** @type {number} Radio máximo de los planetas generados */
const RADIO_PLANETAS_MAX = 50;
/** @type {number} Radio del planeta central del modo centro */
const RADIO_PLANETA_CENTRO = 70;
/** @type {number} Radio del centro de los agujeros negros */
const CENTRO_AGUJERO_NEGRO = 10;
/** @type {number} Radio mínimo del campo gravitatorio de los agujeros negros */
const RADIO_AGUJERO_MIN = 50;
/** @type {number} Radio máximo del campo gravitatorio de los agujeros negros */
const RADIO_AGUJERO_MAX = 70;
/** @type {number} Velocidad lineal mínima a alcanzar para poder salir de órbita voluntariamente */
const VEL_LIN_MIN = 200;

// PROBS
/** @type {number} Probabilidad (entre mil) para cada frame de generar un asteroide*/
const PROB_ASTEROIDE = 0.5;
/** @type {number} Probabilidad (entre mil) para cada frame de desactivar una órbita*/
const PROB_DESACTIVAR = 1;

// LEGACY
// var coloreF = ["#0000b2", "#990000", "#009900", "#999900", "#009999", "#990099", "#444444", "#FF8000", "#FF7777", "#77FF77"];
// var controles = [32,13,81,226,106,220,68,71,74,76];
// var controlesNombre = ["Espacio", "Enter", "Tecla Q", "Tecla >", "Asterisco(*)", "Tecla º", "Tecla D", "Tecla G", "Tecla J", "Tecla L"];

// DISPLAY
const PICS_PLANETAS_N = 17;
var glob_plt_imgs=[];
const MIN_W = 800;
const MIN_H = 600;
const MAP = {h:974, w:1920};
MAP.ar = MAP.w / MAP.h;
var glob_escala = {w: 1, h: 1, update: true};
var glob_debugMode=false;
var glob_fps = 60;
var glob_fps_min = Infinity;

// CANVAS AND GAME
var canvas = null;
var ctx = null;
var juego = null;

function globf_esModo(modo) {
    for(var m in MODOS) {
        if(MODOS.hasOwnProperty(m) && MODOS[m] === modo) {
            return true;
        }
    }
    return false;
}