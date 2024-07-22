

if(process.env.NODE_ENV !=='production')
{ require('dotenv').config();     }

const express = require('express');
const app = express();
const compression = require('compression');
app.use(compression());
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const LocalStrategy = require('passport-local');
const User = require('./model/user');
const sanitizeHtml = require('sanitize-html');
const Campground = require('./model/campground');
const helmet = require('helmet');
const mongoose = require('mongoose');
const AppError = require('./utilities/AppError')
const catchAsync = require('./utilities/catchAsync');
const cloudinary = require('cloudinary').v2;
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const { setEngine } = require('crypto');
const Review = require('./model/review');
const userRoutes = require('./routes/users');
const {isLoggedIn , isAuthor, isReviewAuthor} = require('./middleware')
const multer = require('multer');
const {storage}= require('./cloudinary');
const MongoDBStore = require('connect-mongo');
const upload = multer({storage});
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken:mapBoxToken});

app.engine('ejs' , ejsMate);
const dbUrl ='mongodb://localhost:27017/yelp-app';
//const dbUrl =process.env.db_Url;
mongoose.connect(dbUrl,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    
}).catch('error',(e)=>{
    console.log(e);
});
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const store = new MongoDBStore(
    {
        mongoUrl:dbUrl,
        secret:'thisshouldbebettersecret',
        touchAfter:24*60*60
    }
);
store.on('error' , function(e){
    console,log('session store error',e)
})

const sessionConfig = {
    store:store,
    name:'session',
    secret:'thisshouldbebettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig));

app.use(express.json());
app.use(helmet());
const scriptSrcUrls =[
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://code.jquery.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js",
    "https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js",
    //'https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.js',
    'mapbox://styles/mapbox/streets-v11',
    'mapbox://styles/mapbox/dark-v11',
    
    

];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
//'https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.css' ,
"https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
"https://res.cloudinary.com/dt1wpnqmy/image/upload/",
'mapbox://styles/mapbox/streets-v11',
'mapbox://styles/mapbox/dark-v11',
//'https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.js',


];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://res.cloudinary.com/dt1wpnqmy/image/upload/",
    'mapbox://styles/mapbox/streets-v11',
    'mapbox://styles/mapbox/dark-v11',
    //'https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.js',
    

    
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives:{
defaultSrc:[],
        connectSrc:["'self'", ...connectSrcUrls],
        scriptSrc:["'unsafe-inline'", "'self'",...scriptSrcUrls],
        styleSrc:["'self'", "'unsafe-inline'",...styleSrcUrls],
        workerSrc:["'self'", "blob:"],
        objectSrc:[],
        imgSrc:[
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dt1wpnqmy/",
            "https://images.unsplash.com/",
            'mapbox://styles/mapbox/dark-v11',
    'mapbox://styles/mapbox/streets-v11',

    "https://res.cloudinary.com/dt1wpnqmy/image/upload/",

        ],
        fontSrc:["'self'", ...fontSrcUrls],
    },
    })
);
app.use(passport.initialize());
app.use(passport.session(sessionConfig));
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req, res, next)=>{
    //console.log(req.session)
    if(!['/login' , '/'].includes(req.originalUrl)){
    req.session.returnTo = req.originalUrl
}
    res.locals.currentUser =req.user; 
    console.log(`this is currentUser${res.locals.currentUser}`)
    res.locals.success= req.flash('success');
    res.locals.error = req.flash('error');
next();
})

app.use(methodOverride('_method'));
app.use(express.static(path.resolve('./public')));
app.set('views' , path.join(__dirname , 'views'));
app.set('view engine' , 'ejs');

app.use('/', userRoutes);
const dirty = 'Looks Mischievous';
const clean = sanitizeHtml(dirty , {
    allowedTags:[],
    allowedAttributes:{}
});
console.log(clean)

db = mongoose.connection;
db.on('error', console.error.bind(console , 'error'));
db.once('connected' , ()=>{
    console.log('Connected Successfully');
});
app.get('/fakeUser', async(req,res)=>{
    const user =new User({email:'soby@gmail.com' , username:'BADSHAH'})
const newUser = await User.register(user , 'pumpkin');
res.send(newUser);
})
app.get('/', async(req,res)=>{
    const camp = await Campground.find({});
 const message =req.flash('success')
    res.render('home' , {camp , message  });
})
app.get('/campground' , async(req , res)=>{
  const camp = await Campground.find({});
 const message =req.flash('success')
    res.render('home' , {camp , message  });
});
app.get('/campground/new' ,isLoggedIn, catchAsync(async(req , res)=>{
    res.render('new');
}));
app.post('/campground' ,upload.array('image'),catchAsync( async(req , res, next)=>{
    const geoData =  await geoCoder.forwardGeocode({
        query:req.body.Campground.location,
        limit:1
    }).send();
    if(!req.body.Campground) throw new AppError(501 , 'No content');
    const latest = new Campground({...req.body.Campground});
   latest.author = req.user._id
   latest.geometry = geoData.body.features[0].geometry;
latest.image = req.files.map(f=>({url:f.path , filename:f.filename}));
    await latest.save();
 console.log(latest) ;
   // console.log(geoData.body.features[0].geometry.coordinates);
   // console.log(req.body , req.file , latest.image)
   res.redirect('/campground');
    

}))
app.get('/campground/:id' , catchAsync(async(req , res)=>{
    const {id} = req.params;
   
    const bachcha = await Campground.findById(`${id}`).populate({path:"reviews" , populate:{path:'author'}}).populate('author');
    console.log(bachcha)
    res.render('show', {bachcha});

}));
app.get('/campground/:id/edit',isLoggedIn,isAuthor, async(req , res, next)=>{
   const {id} = req.params;
    const sachcha = await Campground.findById(`${id}` );
  /*  if(!sachcha){
        throw new AppError(401 , 'CampGround  Not Found');
            }*/
    res.render('edit', {sachcha});

    
})
app.put('/campground/:id' , isLoggedIn ,isAuthor,upload.array('image'),catchAsync(async(req ,res , next)=>{
     const {id} = req.params;
    
     const updo = await Campground.findByIdAndUpdate(`${id}`,{...req.body.Campground }, {runValidators:true});
    const img = req.files.map(f=>({url:f.path , filename:f.filename}));
    updo.image.push(...img);
    await updo.save();
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
   await  updo.updateOne({$pull:{image:{filename:{$in:req.body.deleteImages}}}})

}
    console.log(req.body);
    /*if(!updo){
        throw new AppError(401 , 'CampGround  Not Found');
            }*/

   res.redirect(`/campground/${updo._id}`);

}))
app.delete('/campground/:id' ,isLoggedIn,isAuthor,catchAsync( async(req ,res)=>{
    const {id} = req.params;
   await Campground.findByIdAndDelete(id);
    res.redirect('/campground');
}));
app.post('/campground/:id/review' ,isLoggedIn, async (req , res)=>{
    const review = new Review(req.body.review);
    review.author = req.user._id;
    const campd =await Campground.findById(req.params.id);
    await campd.reviews.push(review);
    await campd.save();
    await review.save();
res.redirect(`/campground/${campd._id}`)
})
app.delete('/campground/:id/reviews/:reviewid' ,isLoggedIn, isReviewAuthor,async(req , res)=>{
    const {id, reviewid} = req.params;
    await Campground.findByIdAndUpdate(id ,{$pull:{reviews:reviewid}});
await Review.findByIdAndDelete(reviewid);
console.log('Deleted');
res.redirect(`/campground/${id}`);
})
app.all('*', (req , res , next)=>{
   next( new AppError(401 , 'Try Something Better Idiot'));
})
app.use((err, req , res , next)=>{
const {status = 500 } = err;
if(!err.message) err.message = "Something went wrong";
    res.status(status).render('error' , {err});
   
})
app.listen(3000 , ()=>{
    console.log('On port 3000');
})
