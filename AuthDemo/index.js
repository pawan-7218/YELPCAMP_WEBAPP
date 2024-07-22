const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/authdemo' , {useNewUrlParser:true})
.then(()=>{
    console.log('Mongo Connection OPen')
})
.catch(err =>{
    console.log('Oh no connection error');
    console.log(err);
})

app.set('view engine', 'ejs');
app.set('views' , 'views');
app.use(express.urlencoded({extended:true}));
app.use(session({secret:'notagoodsecret'}));
const requireLogin = (req,res, next)=>{
    if (!req.session.user_id){
        return res.redirect('/login')
    }
    next();
}
app.get('/register', (req, res)=>{
    res.render('register');
})
app.post('/register', async(req, res)=>{
    const {username , password}= req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({username , password:hash});
    await user.save();
    req.session.user_id = user._id;
    res.send(hash);
})
app.get('/login' , (req,res)=>{
    res.render('login');
})
app.post('/login', async(req, res)=>{
    const {username , password} = req.body;
    const foundUser = await User.findAndValidate(username , password);
if(foundUser){
    req.session.user_id = foundUser._id;
    res.redirect('/secret');
}
else{
    res.redirect('/login');
}
})
app.get('/secret', requireLogin,(req, res)=>{
    res.render('secret');
})
app.post('/logout' ,(req, res)=>{
req.session.user_id = null;
res.redirect('/login');
} )
app.listen(3000, ()=>{
    console.log('Serving your app!')
})
//const { default: mongoose } = require('mongoose');
/*const hashPassword = async(pw)=>{
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(pw, salt);
    console.log(salt);
    console.log(hash);
}*/
/*const hashPassword = async(pw)=>{
    const hash = await bcrypt.hash(pw ,12);
    console.log(hash);
}
const login = async(pw , hashedpw)=>{
    const result = await bcrypt.compare(pw , hashedpw);
    if(result){
        console.log('Logged YouIn! Successful Match');
    }else{
        console.log('incorrect');
    }
}*/
//hashPassword('monkey' );
//login('monkey' , '2b$12$4mH9Zk3ZQDx5S81r4sgtneWh90FHPoFoI4HZ03.7G5Sej/9nCsWz2');
