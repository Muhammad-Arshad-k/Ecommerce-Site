const express = require('express');
const path  =  require('path');
const session = require('express-session');
const userRouter  = require('./router/user');
const adminRouter = require('./router/admin');
const fileUpload  = require('express-fileupload');
require('./config/connection')


var app= express();
//view engine setup
app.set('view engine', 'ejs');
app.set('views');
//to access the public files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname))
//session 
app.use(session({
    secret:"thisismysecretkey",
    saveUninitialized:true,
    cookie:{maxAge:6000000},
    resave:false
}))

app.use(fileUpload())
//to prevent storing cache memory
app.use((req,res,next)=>{
    res.set(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    
    next();
});

//routes
app.use('/',userRouter)
app.use('/admin',adminRouter)



app.listen(3000,()=>{
    console.log('server is listening')
})
   