  const express = require('express');
  const res = require('express/lib/response');
  const router = express.Router();
  const passport =require('passport');
  const multer     = require('multer')
  var XLSX       = require('xlsx');
  const result = require('../models/evalpares');
  const resulttuto = require('../models/evaltuto');
  const VerificarUser = require('../middlewares/VerificarUser');

  
   //multer 
   var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  });

  var upload = multer({ storage: storage });

  router.get('/', (req, res, next) =>{
      res.render('login');
  });

  router.post('/', passport.authenticate('local-login',{
      successRedirect: '/sistema',
      failureRedirect: '/',
      passReqToCallback: true
  }));

  router.post('/registro', passport.authenticate('local-registro',{
      successRedirect:'/',
      failureRedirect: '/registro',
      passReqToCallback: true
  }))

  router.get("/logout", (req, res) => {
      req.logout(req.user, err => {
        if(err) return next(err);
        res.redirect("/");
      });
    });

    router.get('/sistema', VerificarUser, upload.single('excel'), (req, res) =>{
        result.find((err,data)=>{
            //console.log(data);
            if(err){
                console.log("ERROR");
                console.log(err)
            }else{
                if(data!=''){
                    console.log("DATA");
                    res.render('sistema',{result:data});
                }else{
                    console.log("DATA VACIA");
                    res.render('sistema',{result:{}});
                }
            }  
        });
        });

    router.post('/sistema'  ,upload.single('excel'),(req,res)=>{
        var workbook =  XLSX.readFile(req.file.path);
        var sheet_namelist = workbook.SheetNames;
        var x=0;
        sheet_namelist.forEach(element => {
            var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_namelist[x]]);
            resulttuto.insertMany(xlData,(err,data)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log(data);
                }
            })
            x++;
        });
        res.redirect('/sistema');
      });

      router.get('/EvalTutoria',  upload.single('excel'), (req, res) =>{
        resulttuto.find((err,data)=>{
            //console.log(data); 
            if(err){
                console.log("ERROR");
                console.log(err)
            }else{
                if(data!=''){
                    console.log("DATA");
                    res.render('EvalTutoria',{resulttuto:data});
                }else{
                    console.log("DATA VACIA");
                    res.render('EvalTutoria',{resulttuto:{}});
                }
            }  
        });
        });

        router.post('/sistema'  ,upload.single('excel'),(req,res)=>{
            var workbook =  XLSX.readFile(req.file.path);
            var sheet_namelist = workbook.SheetNames;
            var x=0;
            sheet_namelist.forEach(element => {
                var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_namelist[x]]);
                resulttuto.insertMany(xlData,(err,data)=>{
                    if(err){
                        console.log(err);
                    }else{
                        console.log(data);
                    }
                })
                x++;
            });
            res.redirect('/sistema');
          });
  
  router.get('/registro', (req, res, next)=>{
    res.render('registro');
})





  module.exports = router 