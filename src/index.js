const express = require('express');
const morgan = require('morgan');
const path = require('path')
const engine = require('ejs-mate');
const passport = require('passport')
const session = require('express-session')
const flash = require('connect-flash')
var bodyParser = require('body-parser');


//inicializacion
const app = express();  
const PORT = 4000;
require('./database') 

//-------------------------

require('./passport/local-auth')

//configuracion 

app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs')
app.use(express.static(path.resolve(__dirname,'public')));

    //inicio de servidor
app.listen(PORT, ()=>{
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
 

 
//-------------------------------------------
app.use(bodyParser.urlencoded({extended:false}));

app.use(express.urlencoded({extended:false}))
app.use(session({
    secret:'mysecretsession',
    resave: false,
    saveUninitialized:false
}))
 
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next)=>{
   app.locals.signupMessage = req.flash('signupMessage');
   app.locals.loginMessage = req.flash('loginMessage');
   app.locals.user = req.user;
   console.log(app.locals)
   next()
})

//rutas 

app.use('/', require('./routes/index'))

//middleware

app.use(morgan('dev')); 

//app.use(function(req,res){
  //  res.status(404).render('not-found.ejs', {title: "no encontrado"})
//}) 

//********************* */
