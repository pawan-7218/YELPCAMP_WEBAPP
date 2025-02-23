const express = require('express');
const router = express.Router();
const passport = require('passport');
const session = require('express-session');
const User = require('../model/user');
const catchAsync = require('../utilities/catchAsync');


router.get('/register',(req, res)=>{
res.render('users/register');
})
router.post('/register' , catchAsync(async(req , res, next)=>{
try{
const { username,email, password} = req.body;
const user = new User({email,username});
const registeredUser = await User.register(user, password);
req.login(registeredUser, err =>{
    if (err) return next (err);
    req.flash('success','Welcome to Yelp Camp');
res.redirect('/campground' );
})

} catch (e) {
    req.flash('error' , e.message);
    res.redirect('register')
}
}));
router.get('/login', (req,res)=>{
    res.render('users/login');
});
router.post('/login' ,passport.authenticate("local",{failureFlash:true, failureRedirect:"/login" }), (req,res)=>{
    req.flash('success' , 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campground';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
 
});
/*router.get('/logout' , (req,res,next)=>{
    req.logout();
    res.redirect('login');

});*/
router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/campground');
    });
  });
module.exports = router;