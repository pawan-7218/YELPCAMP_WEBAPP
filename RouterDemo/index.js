const express = require('express');
const app = express();
const shelterRoutes = require('./Routes/shelter');
const adminRoutes = require('./Routes/admin');
app.use('/shelters', shelterRoutes);
app.use('/admin' , adminRoutes);
app.listen(3000 , ()=>{
    console.log('Server connected')
});