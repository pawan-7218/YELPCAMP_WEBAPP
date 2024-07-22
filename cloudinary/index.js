const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage } = require('multer-storage-cloudinary');
 cloudinary.config({
   cloud_name: process.env.Cloudinary_Cloud_name,
   api_key: process.env.Cloudinary_KEY,
   api_secret: process.env.Cloudinary_SECRET

 });
 const storage = new CloudinaryStorage({
    cloudinary,
    params:{
    folder : 'YelpApp',
    allowedFormats : ['jpeg' , 'jpg', 'png' ]
}
 })
 module.exports ={
    cloudinary,
    storage
 }
