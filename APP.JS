//Required As First Package - Local Enviroment Variables e.g. API Keys And Email Configuration
require('dotenv').config();

//Dependencies For The Application
var express = require("express"),
      app = express(),
      bodyParser = require("body-parser"),
      flash = require("connect-flash"),
      session = require("express-session"),
      indexRoutes = require("./ASSETS/Source/Routes/Index");


//Deafult Engine For The Projects
app.set("view engine", "ejs");

//Default Directory To Look In For EJS
app.set("views", "./ASSETS/Build/Views");

//Allows Form Data To Be Requested
app.use(bodyParser.urlencoded({ extended: true }));

//Seassion Configuration
app.use(session({
    secret: "Portfolio Website",
    resave: false,
    saveUninitialized: false
}));

//Connect Flash
app.use(flash());

//Gloal Data
app.use(function(req, res, next) {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


/*
Acts As Placeholder For Routes
//Routes Are Seperated So In The Future The Application
Can Quickly Scale Up
*/
app.use("/" ,indexRoutes);


//----------------------------------------------------------------------------//
//---------------------------------Server Message------------------------//
//----------------------------------------------------------------------------//

var port = 3000 || process.env.PORT ;

app.listen(port, function (err) {

//Error Handling
  if(err){
    console.log("***********************************");
    console.log("The Server Couldnt Due To Technical Issues");
    console.log("***********************************");
    console.log("The Error Was");
    console.log("***********************************");
    console.log(err);
    console.log("***********************************");
  } else {
    //Welcome Message
    console.log("The Server Has Successfully Started On http://localhost:8080");
    console.log("Any Changes The Browser Will Reload Automatically Via Browser Sync");
  }
});
