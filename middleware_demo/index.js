const express = require('express');
const app = express();
const AppError = require('../utilities/AppError');
const morgan = require('morgan');
const { networkInterfaces } = require('os');
app.use(morgan('common'));
app.use('/user', (req, res, next) => {
  req.requesttime = Date.now();
    console.log('Request Type:', req.method)
    next()
  })

  app.use((req , res , next)=>{
    console.log('this is my first middleware');
   return next()
    console.log('nice guy')

  })
  app.use((req , res , next)=>{
    console.log('this is my second middleware');
   return next()
  })
  const verifyPassword = (req , res , next)=>{
   const {password} = req.query;
    if (password === 'chicken'){
      next();
    }
    else{
      throw new AppError(405, 'Password Required');
      
    }
  }
  
  
app.get('/user',verifyPassword ,(req , res)=>{
    console.log(`it worked ${req.requesttime}`);
    res.send(' it worked')
})
app.get('/song', (req, res)=>{
  throw new AppError(500, 'bloody basket');
})
app.use((req , res)=>{
  res.status(404).send('not found')
})
app.use((err , req , res , next)=>{
  
  const {status , message} = err;
  res.status(status).send(message);
})
app.listen('3000', async()=>{
    await console.log('connected');
})
