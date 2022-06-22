const passport = require('passport');
const LocalStrategy =require('passport-local').Strategy

const User = require('../models/users')

passport.serializeUser((user, done)=>{
    done(null, user.id)
})

passport.deserializeUser(async (id, done)=>{
    const user = await User.findById(id);
    done(null, user);
})

//registro (temporal)
passport.use('local-registro', new LocalStrategy({
    usernameField: 'usuario',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, usuario, password, done)=>{
   const user = await User.findOne({usuario: usuario})
    console.log(user)
    if(user){
        return done(null, false, req.flash('signupMessage', 'El Usuario ya existe.'))
    } else{
        const newUser = new User();
        newUser.usuario = usuario;
        newUser.password = newUser.encryptPassword(password);  
        await newUser.save()
        done(null, newUser)
   } 
}))

//login
passport.use('local-login', new LocalStrategy({
    usernameField:'usuario',
    passwordField:'password',
    passReqToCallback: true
}, async (req, usuario, password, done) => {
const user = await User.findOne({usuario: usuario}) 
if(!user) {
    return done(null, false, req.flash('loginMessage', 'Usuario no encontrado.'))
} if(!user.comparePassword(password)){
    return done(null, false, req.flash('loginMessage', 'Contraseña incorrecta, Revisa tu contraseña!'));
} 
done(null, user)

}))
