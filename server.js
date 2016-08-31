var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var _ = require('lodash');
var multer = require('multer');

var config = require('./server/config/main');
var app = express();

var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');

// Add middleware necessary for REST API's;
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));
app.use(session({secret: config.secret}))
app.use(cookieParser());
app.use(passport.initialize());
app.use(multer({
  dest: './uploads/',
  limits: {
    fieldNameSize: 100,
    files: 20,
    fields: 20
  },
  onFileSizeLimit: function (file) {
    console.log('Failed: ', file.originalname)
    fs.unlink('./' + file.path) // delete the partially written file
  }
}).any());


// CORS Support
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

// Shortcuts
app.use('/js', express.static(__dirname + '/client/js'));
app.use('/css', express.static(__dirname + '/client/css'));
app.use('/views', express.static(__dirname + '/client/views'));
app.use('/images', express.static(__dirname + '/client/images'));
app.use('/fonts', express.static(__dirname + '/client/fonts'));

app.set('json spaces', 2);

app.models = require('./server/models/index.js');


// Connect to port 3000
app.set('port', process.env.PORT || 3000)

app.listen(app.get('port'), function(){
	console.log("The application is running on localhost 3000");
})

// Connect to db
mongoose.Promise = global.Promise;
mongoose.connect(config.database);

// Passport strategy
require('./server/config/passport')(passport);


// Init go to index.html
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
// Routes
app.use('/api', passport.authenticate('jwt', {session: false}), require('./server/routes/home.route.js'));
app.use('/login', require('./server/routes/login.route.js'));
app.use('/register', require('./server/routes/register.route.js'));
app.use('/user', passport.authenticate('jwt', {session: false}), require('./server/routes/user.route.js'));

app.use('/pictures/', require('./server/routes/picture.route.js'));

// Error handling
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log("General error");
  console.log(err.message)
  // res.render('error', {
  //   message: err.message,
  //   error: err
  // });
});
