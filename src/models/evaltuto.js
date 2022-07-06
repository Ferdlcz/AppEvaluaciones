const mongoose = require('mongoose');

var tutoSchema = new mongoose.Schema({
    codigo:Number,
    nombrecompleto:String,
    direccion:String,
    calificacion:String
});

module.exports = mongoose.model('tutoData', tutoSchema);