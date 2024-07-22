const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require('express-flash');

const MongoDBStore = require('connect-mongo')
const bodyParser = require("body-parser")
app.engine('ejs',ejsMate)
//app.use(require('body-parser').urlencoded({ extended: true }))
const User = require('./models/User');
const { request } = require('http');
//app.use(bodyParser.urlencoded({ extended: true }));
const db_Url = 'mongodb://localhost:27017/fun';

app.use(express.urlencoded({ extended: true }));
const db = async()=>{
    try {
        await mongoose.connect(db_Url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Connected to mongodb  ' )
} catch (error) {
    console.log(error)
}}
db();


const sessionConfig = {
  secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoDBStore({
        mongoUrl:db_Url,
        secret: 'keyboard cat',
        touchAfter: 24 * 60 * 60
}),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        expires: Date.now() + 1000*60*60*24*7,
        httpOnly: true
    },
    name: 'session',}
app.use(session(sessionConfig));
app.use(flash())
app.use(function(req, res, next) {
  res.locals.message= req.flash();
next();})

app.use(passport.initialize());
app.use(passport.session());
app.set('views' , path.join(__dirname , 'views'));
app.set('view engine' , 'ejs');
const comparePassword = async(username , password)=>{
    const hash = await User.findOne({ username:username})
    return  await bcrypt.compare(password, hash.password)
}
passport.use(new LocalStrategy(async function(username, password, done) {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        // If the username is not found, authentication fails
        return done(null, false);
      }
      const isMatch = await comparePassword(username, password);
      if (isMatch) {
        // If the password matches, authentication succeeds and the user is returned
        return done(null, user ,);
      } else {
        // If the password doesn't match, authentication fails
        return done(null, false , {message: 'password mismatch'})
      }
    } catch (error) {
      return done(error);
    }
  }));
passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id)
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        done(err, null);
      });
  });


app.get('/', (req, res) => {
    res.render('register');})

const saltRound = 10

app.post('/register', async(req, res) => {
    console.log(req.body)
    const {username, password,email} = req.body

    try {
        const salt = await bcrypt.genSalt(saltRound)

        const hash = await bcrypt.hash(password , salt);
        const user =  new User({username:username, password:hash,
            email: email})
    await user.save()
    
  

    res.redirect('/login')
    } catch (error) {
        console.log(error)
    }
})
app.get('/login', (req, res)=>{
req.flash('success','you have successfully logged in')
    res.render('login' ,)});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect:'/home',
    failureRedirect: '/login',
    failureFlash:true
  })(req, res, next);

});
     
 
app.get('/home', (req, res)=>{
  req.flash('success','you have successfully signed in')

   //const messages = {success: successMsg, error: errorMsg};
  res.render('home' ,);});

app.post('/logout', async(req, res)=>{
  await req.session.destroy()
  res.redirect('/')
});

app.listen('7000',()=>{
    console.log('Express server listening');});