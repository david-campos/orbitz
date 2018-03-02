var Log = {
    notas: [],
    /**
     * Posta una nueva nota para mostrar
     * @param {String} mensaje el mensaje de la nota
     * @param {Jugador} [jugador] el jugador al que va dirigida
     */
    nuevaNota: function(mensaje, jugador) {
        var miNota = {};
        miNota.mensaje = mensaje;
        miNota.t = Date.now() + 5000;
        miNota.color = jugador ? jugador.color : "gray";
        this.notas.push(miNota);
    },
    clear: function() {
        this.notas.splice(0, this.notas.length);
    }
};