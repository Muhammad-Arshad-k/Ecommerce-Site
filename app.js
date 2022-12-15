const express     = require('express');
const path        =  require('path');
var app           = express();
const session     = require('express-session');
const userRouter  = require('./router/user');
const adminRouter = require('./router/admin');
const fileUpload  = require('express-fileupload');
const dotenv      = require("dotenv");
const dbconnect   = require('./config/connection')


dbconnect.dbconnect();
app.listen(process.env.PORT_NO,()=>{
    console.log("server started listening to port 3000");
});

dotenv.config();

aEmail        = process.env.ADMIN_EMAIL 
aPassword     = process.env.ADMIN_PASSWORD

//view engine setup 
app.set('view engine', 'ejs');
app.set('views');
//to access the public files
app.use(express.static(path.join(__dirname, 'public')));
 
//session 
app.use(session({
    secret:"thisismysecretkey",
    saveUninitialized:true,
    cookie:{maxAge:6000000},
    resave:false
}))

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//to prevent storing cache 
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



