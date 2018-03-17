// 1 - Require Dependencies Needed To Perform Tasks
// 2 - Create Indvidual Tasks Using Gulp + Other Plugins
// 3 - Default Taks - Inlcudes Array Of Tasks Created, Use Gulp To Run Default Tasks
// 4 - Watch Task - Any Changes It Will Rerun A Task And The Browser Will Reload The Page
// 5 - Any Errors Plumber Will Alert You via Notification
// Note: Even Without The Build File Gulp Will Still Run, It Will Just Create The File

//GULPFILE Dependencies
var   gulp               = require ("gulp"),  //Gulp Pluign
      sass                  = require ("gulp-sass"),  //SASS Plugin
      image              = require ("gulp-image"),  //Image Compression Plugin
      uglify               = require ("gulp-uglify"),  //Javascript Minification Plugin
      plumber           = require ("gulp-plumber"), // Plumber - Error Handle Plugin
      notify               = require ("gulp-notify"), // Error Notification Plugin - Used Inconjunction with Plumber
      sourceMaps     = require ("gulp-sourcemaps"), //Source Map Plugin - Used For Debugging
      concat              = require ("gulp-concat"), //Contactination - Combines All Files Together
      browserSync   = require('browser-sync').create(), //  Browser Sync (Auto Reload)
      ejs                    = require("gulp-ejs"), //Gulp Ejs Files
      minifyEjs         = require("gulp-minify-ejs"), //Minfies ejs files
      nodemon          = require('gulp-nodemon') , //Nodemon But In Gulp Format
      reload = browserSync.reload; //Reload Function From Browser Sync


/*
Inital Taks - Compiles Files Once, Used In The Default Taks. Also This Is Going To Build The FIle
When Its Uploaded To Service Provider
*/
gulp.task("inital", ["styles","bootstrap-scripts","customJS","routes","image","ejs"], function(){

});

//Credit To https://www.youtube.com/watch?v=_BNo2VCr2k8&list=WL&t=200s&index=24
//For The Solution To Running  Browser Sync And Nodemon Server At The Same Without The Two Servers At The Same Time

// Serve Task
// Depends On Browser Sync
gulp.task('serve',
  [
    'browser-sync', //WhenThe Website Starts
  ],

  //Watch Function For Browser Sync
  //When Changs Are Detected A Specified Task Will Rerun
  function (done) {
    gulp.watch("ASSETS/Source/Stylesheets/SASS/**/*.sass", ["styles"]); // Watches All SASS Directory
    gulp.watch("ASSETS/Source/Stylesheets/SASS/**/*.scss", ["styles"]); // Watches All SCSS Directory
    gulp.watch("ASSETS/Source/Scripts/*.js", ["bootstrap-scripts", "customJS"]); // Watches Scripts JS File Extensions Directory
    gulp.watch("ASSETS/Source/Routes/*.js", ["routes"]); //Watches Routes Directory
    gulp.watch("ASSETS/Source/Images/*", ["image"]); // Watches Image Directory
    gulp.watch("ASSETS/Source/Views/*.ejs", ["ejs"]); // Watches Image Directory
    gulp.watch("ASSETS/Source/Views/Partials/*.ejs", ["ejs"]); // Watches Image Directory
    gulp.watch("*.ejs").on('change', browserSync.reload); //Reloads EJS Files After Rerunning The Task/s

    //When The Task Is Run The Browser Sync Reloads
    browserSync.reload();

    //Stops After
    done();
  }
);

//Browser Sync Depeneds On Nodemon
gulp.task('browser-sync',
  [
    'nodemon'
  ],
  function() {
    browserSync.init({
      proxy: 'http://localhost:3000', //APP.js port number - Listens On This Port
      port: 3128, //Browser Sync Port  - Actually Running On 8080
      ws: true, // enables websockets,
      serveStatic: ['.'], // Starting Point For Gulpfile -  (ESSENTIAL PART, WONT WORK WITHOUT IT)
      reloadOnRestart: true, // auto-reload all browsers following a Browsersync reload
      logLevel: "debug", //Provides Additonal Debug Information
       Ui: false, //Enables Or Disables Browser Sync UI
      logPrefix: "Portfolio Website", //[BS] Now Is [Portfolio Website]
      logConnections: true, //Shows Connected Devices

      watchOptions: {
        ignoreInitial: true,
        ignored: '*.map'
      },

    });
  }
);

//Starts Express Server
gulp.task('nodemon',
  function (done) {
    var running = false; //Default State

    //Starting Point And Watch Root Directory
    return nodemon({
      script: 'APP.js', //APP JS File
      watch: ['.'] //Root Of Directory
    })

    //On Start Done Function Is Run Once
    //Stops Server Brwoser Sync From Starting Multiple Times
    .on('start', function () {

      //First Time Through
      if (!running) {
        done(); //Triggers Browser Sync
      }
      running = true;
    })

    //Minor Dely Of 500ms
    .on('restart', function () {
      setTimeout(function () {
        reload();
      }, 500);
    });
  }
);

//SASS To CSS Task
gulp.task("styles", function(){
  return gulp.src("ASSETS/Source/Stylesheets/SASS/APP.scss")

  //Error Handling - Thanks To Sandro Pasquali (https://gist.github.com/floatdrop/8269868)
  .pipe(plumber({

    //Error Handle Function
    errorHandler: function(err) {

      //Gulp Notify Custom Message
      notify.onError({
        title:    "Gulp - Routes Task",
        message:  "Error: <%= error.message %>",
        sound:    "Bottle"
      })(err);

      //Stops Here Upon An Error Message Appearing, Once The Document Is Resaved It Will Rerun
      this.emit('end');
    }
  }))

  //Passes In An Object Into The SASS Plugin To Compress The CSS Output
  .pipe(sass({outputStyle: 'compressed'}))

  //Output Location For File
  .pipe(gulp.dest("ASSETS/Build/CSS/"))

  //Writes The Source Map
  .pipe(sourceMaps.write("../Maps/CSS"))

  //Allows CSS To Be Injected Into Browser Syncs Session
  .pipe(browserSync.reload({stream : true}));
});

//Route Minification
gulp.task("routes", function(){

  //Source Location - All Javascript  Files Get Compiled
  return gulp.src("ASSETS/Source/Routes/*.js")

  //Source Map Initalisation
  .pipe(sourceMaps.init())

  //Uglify (Minifying)
  .pipe(uglify())


  //Error Handling - Thanks To Sandro Pasquali (https://gist.github.com/floatdrop/8269868)
  .pipe(plumber({

    //Error Handle Function
    errorHandler: function(err) {

      //Gulp Notify Custom Message
      notify.onError({
        title:    "Gulp - Routes Task",
        message:  "Error: <%= error.message %>",
        sound:    "Bottle"
      })(err);

      //Stops Here Upon An Error Message Appearing, Once The Document Is Resaved It Will Rerun
      this.emit('end');
    }
  }))

    //Writes The Source Map
    .pipe(sourceMaps.write("../Maps/Routes"))

    //Destination Of Output
    .pipe(gulp.dest("ASSETS/Build/Routes"))

    //Allows Routes To Be Injected Into Browser Syncs Session
    .pipe(browserSync.stream({stream: true}));
});


//Image Minification
gulp.task("image", function(){

  //Source Location - All Images Get Minified
  return gulp.src("ASSETS/Source/Images/*")

  //Error Handling - Thanks To Sandro Pasquali (https://gist.github.com/floatdrop/8269868)
  .pipe(plumber({

    //Error Handle Function
    errorHandler: function(err) {

      //Gulp Notify Custom Message
      notify.onError({
        title:    "Gulp - Images Task",
        message:  "Error: <%= error.message %>",
        sound:    "Bottle"
      })(err);

      //Stops Here Upon An Error Message Appearing, Once The Document Is Resaved It Will Rerun
      this.emit('end');
    }
  }))

  //Image Minification
  .pipe(image({
   pngquant: true,
   optipng: false,
   zopflipng: true,
   jpegRecompress: false,
   mozjpeg: true,
   guetzli: false,
   gifsicle: true,
   svgo: true,
   concurrent: 10,
   quiet: true
 }))

  //Destination Of Output
  .pipe(gulp.dest("ASSETS/Build/Images"))

  //Allows New Images To Be Injected Into Browser Syncs Session
  .pipe(browserSync.stream({stream: true}));
});

//Bootstrap Dependencies Minification
gulp.task("bootstrap-scripts", function(){

  //Source Of Task - Contains An Arry Of 6 Sources And Compiles To One File
  //Must Be This Order - Bootstrap Dependencies Are Fragile Andd Reuire A Certain Order
  return gulp.src([
     "ASSETS/Source/Scripts/tether-1.3.3/dist/js/tether.js", //Tether js - Bootstrap Tooltips
    "ASSETS/Source/Frameworks/Bootstrap-Framework/dist/js/bootstrap.js", //Bootstrap Js
  ])

  //Source Map Initalisation
  .pipe(sourceMaps.init())

  //Bundles The Source Into One Big FIle Know As Main.js
  .pipe(concat("bootstrap-dependencies.js"))

  //Uglify (Minifying)
  .pipe(uglify())

  //Error Handling - Thanks To Sandro Pasquali (https://gist.github.com/floatdrop/8269868)
  .pipe(plumber({

    //Error Handle Function
    errorHandler: function(err) {

      //Gulp Notify Custom Message
      notify.onError({
        title:    "Gulp - Bootstrap Dependencies Task",
        message:  "Error: <%= error.message %>",
        sound:    "Bottle"
      })(err);

      //Stops Here Upon An Error Message Appearing, Once The Document Is Resaved It Will Rerun
      this.emit('end');
    }
  }))

  //Writes The Source Map
  .pipe(sourceMaps.write("../Maps/JS"))

  //Destination Of Output
  .pipe(gulp.dest("ASSETS/Build/Scripts/"))

  //Allows Javascript To Be Injected Into Browser Syncs Session
  .pipe(browserSync.stream({stream: true}));
});

//jQuery Minification
gulp.task("customJS", function(){

  //Source Of Task - Contains An Arry Of 6 Sources And Compiles To One File
  gulp.src([
    "ASSETS/Source/Scripts/jquery-3.3.1.js", // Latest Version Of Jquery
    "ASSETS/Source/Scripts/validation.JS" //Validation For The Form
  ])

  //Source Map Initalisation
  .pipe(sourceMaps.init())

  //Bundles The Source Into One Big FIle Know As Main.js
  .pipe(concat("main.js"))

  //Uglify (Minifying)
  .pipe(uglify())

  //Error Handling - Thanks To Sandro Pasquali (https://gist.github.com/floatdrop/8269868)
  .pipe(plumber({

    //Error Handle Function
    errorHandler: function(err) {

      //Gulp Notify Custom Message
      notify.onError({
        title:    "Gulp - Custom Javascript Task",
        message:  "Error: <%= error.message %>",
        sound:    "Bottle"
      })(err);

      //Stops Here Upon An Error Message Appearing, Once The Document Is Resaved It Will Rerun
      this.emit('end');
    }
  }))

  //Writes The Source Map
  .pipe(sourceMaps.write("../Maps/JS"))

  //Destination Of Output
  .pipe(gulp.dest("ASSETS/Build/Scripts/"))

  //Allows Javascript To Be Injected Into Browser Syncs Session
  .pipe(browserSync.stream({stream: true}));
});

gulp.task("ejs", ["ejs-partials"], function(){

  //Source Location
  gulp.src("ASSETS/Source/Views/*.ejs")

  //Source Map Initalisation
  .pipe(sourceMaps.init())

  //Pipes The Industry
  .pipe(ejs({}))

   //Error Handling - Thanks To Sandro Pasquali (https://gist.github.com/floatdrop/8269868)
  .pipe(plumber({

    //Error Handle Function
    errorHandler: function(err) {

      //Gulp Notify Custom Message
      notify.onError({
        title:    "Gulp -EJS Task",
        message:  "Error: <%= error.message %>",
        sound:    "Bottle"
      })(err);

      //Stops Here Upon An Error Message Appearing, Once The Document Is Resaved It Will Rerun
      this.emit('end');
    }
  }))

  //Destination Of Output
  .pipe(gulp.dest("ASSETS/Build/Views"))

  //Allows EJS To Be Injected Into Browser Syncs Session
  .pipe(browserSync.stream({stream: true}));
});

gulp.task("ejs-partials", function(){

  //Source Location
  return gulp.src("ASSETS/Source/Views/Partials/*.ejs")

  //Pipes The Industry
  .pipe(ejs({}))

   //Error Handling - Thanks To Sandro Pasquali (https://gist.github.com/floatdrop/8269868)
  .pipe(plumber({

    //Error Handle Function
    errorHandler: function(err) {

      //Gulp Notify Custom Message
      notify.onError({
        title:    "Gulp -EJS Partial Task",
        message:  "Error: <%= error.message %>",
        sound:    "Bottle"
      })(err);

      //Stops Here Upon An Error Message Appearing, Once The Document Is Resaved It Will Rerun
      this.emit('end');
    }
  }))

  //Destination Of Output
  .pipe(gulp.dest("ASSETS/Build/Views/Partials"))

  //Allows EJS To Be Injected Into Browser Syncs Session
  .pipe(browserSync.stream({stream: true}));
});

/*
- Default Task - Array Of Tasks Which Run When The gulp Command Is Run
- After Running All Tasks Then The Watch Task Keeps Happening Until
- The Command Line Is Either Closed Or Stopped Manually
*/
gulp.task("default", ["inital","serve"]);
