const mongoose = require('mongoose');

var paresSchema = new mongoose.Schema({
    codigo:Number,
    nombrecompleto:String,
    direccion:String,
    calificacion:String
});

module.exports = mongoose.model('excelData', paresSchema);