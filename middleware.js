const Campground = require('./model/campground');
const AppError = require('./utilities/AppError')
const Review = require('./model/review');




module.exports.isLoggedIn =(req,res,next)=>{
    if (!req.isAuthenticated()){
        req.flash('error' , 'You must be signed in first!');
        return res.redirect('/login');
    }
    next()
}
module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        return res.redirect(`/campground/${id}`);
    }
    next();
}
module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id , reviewid} = req.params;
    const review = await Review.findById(reviewid);
    if(!review.author.equals(req.user._id)){
        return res.redirect(`/campground/${id}`);
    }
    next();
}