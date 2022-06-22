const express = require('express');
const morgan = require('morgan');
const path = require('path')
const engine = require('ejs-mate');
const passport = require('passport')
const session = require('express-session')
const flash = require('connect-flash')
var bodyParser = require('body-parser');
var XLSX       = require('xlsx');
var multer     = require('multer');


const Pares = require('../src/models/evalpares')

//inicializacion
const app = express();  
const PORT = 3000;
require('./database') 
//-------------------------




require('./passport/local-auth')

  //multer
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  });
  
  var upload = multer({ storage: storage });

//configuracion 



app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));

    //inicio de servidor
app.listen(PORT, ()=>{
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
})

//middleware

app.use(morgan('dev')); 
 
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

//********************* */

app.get('/Eval_Pares', (req, res, next)=>{
    Pares.find((err,data)=>{
        if(err){
            console.log(err)
        }else{
            if(data!=''){
                res.render('Eval_Pares',{respar:data});
            }else{
                res.render('Eval_Pares',{respar:{}});
            }
        }
    });
})


app.post('/Eval_Pares',upload.single('excel'),(req,res)=>{
    var workbook =  XLSX.readFile(req.file.path);
    var sheet_namelist = workbook.SheetNames;
    var x=0;
    sheet_namelist.forEach(element => {
        var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_namelist[x]]);
        Pares.insertMany(xlData,(err,data)=>{
            if(err){
                console.log(err);
            }else{
                console.log(data);
            }
        })
        x++;
    });
    res.redirect('/Eval_Pares');
  });