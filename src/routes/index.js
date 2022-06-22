  const express = require('express');
  const res = require('express/lib/response');
  const router = express.Router();
  const passport =require('passport');




  router.get('/', (req, res, next) =>{
      res.render('login');
  });

  router.post('/', passport.authenticate('local-login',{
      successRedirect: '/sistema',
      failureRedirect: '/',
      passReqToCallback: true
  }));

  router.get('/registro', (req, res, next)=>{
      res.render('registro');
  })

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

    

  // rutas protegidas----------------------------------------------

  router.use((req,res,next)=>{
      isAuthenticated(req, res, next);
      next();
  });

  function isAuthenticated (req, res, next) {
      if(req.isAuthenticated()){
          return next();
      }
      res.redirect('/')
  }

  router.get('/sistema', (req, res, next) =>{
    res.render('sistema')
    });

    

  module.exports = router 