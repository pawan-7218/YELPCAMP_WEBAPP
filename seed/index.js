const express = require('express');
const app = express();
const Campground = require('../model/campground');
const {cities} = require('./cities');
const {descriptors , places} = require('./seedhelpers');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-app', {
    useNewUrlParser:true
}).then(()=>{
    console.log('database created');
}).catch((err)=>{
    console.log(err);
});
const random = (array)=>array[Math.floor(Math.random()*array.length)];
const ditto= async()=>{
await Campground.deleteMany({});
for (let i=0; i<50 ; i++){

     const randomm = Math.floor(Math.random()*1000);
     
const data = new Campground({
    location:`${cities[randomm].city} , ${cities[randomm].state}`,
title:`${random(descriptors)}  ${random(places)}` ,
author:'63ebb2b92593e821cd804195',
geometry:{
     type: 'Point', 
     coordinates: [ cities[randomm].longitude ,
    cities[randomm].latitude ]
 },
  
image:[ {url: 'https://res.cloudinary.com/dt1wpnqmy/image/upload/v1676615967/YelpApp/ozh9wyxueuao1m9tkaio.jpg',

filename: 'YelpApp/ozh9wyxueuao1m9tkaio'},
{url: 'https://res.cloudinary.com/dt1wpnqmy/image/upload/v1676615969/YelpApp/psdo376dzgw4jt00ztys.jpg',
filename: 'YelpApp/psdo376dzgw4jt00ztys'}]
})
await data.save();

}}
ditto();