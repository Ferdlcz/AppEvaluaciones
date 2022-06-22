var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/evaluaciones', {
      //  useCreateIndex: true,
      //  useFindAndModify: false,
        useNewUrlParser: true
    }).then(db => console.log('conexion exitosa'))
    .catch(err => console.log('error al conectar: ', err))