const mongoose = require('mongoose');
const review = require('./review');
const ImageSchema = new mongoose.Schema({
    url:String,
    filename:String
});
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = {toJSON:{virtuals:true}};
const Campgroundschema = new mongoose.Schema({
    title:{
        type:String,
        required: true

    },
    price:Number,
    image:[ImageSchema],
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    description:String,
    location:String,
    author:{
        type:mongoose.Schema.Types.ObjectId ,
        ref:'User'
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
ref:"Review"
        }
    ]
},opts);
Campgroundschema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campground/${this._id}">${this.title}</a></strong>`;
    
   })

Campgroundschema.post('findOneAndDelete', async function(doc){
    if (doc){
        await review.deleteMany({
            _id:{$in:doc.reviews}
        })
    }
})
module.exports = new mongoose.model('Campground' , Campgroundschema);