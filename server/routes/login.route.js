let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
// let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let path = require('path');
let appDir = path.dirname(require.main.filename);
let jwt = require('jsonwebtoken');
let config = require('../config/main');
let User = require(appDir+'/server/models/user.js');



// // Passport strategy
// passport.use(new LocalStrategy(
// 	function(username, password, done){
// 	  User.findOne({email: username}, function(err, user){
// 	  	if(err){
// 	  		console.log("Error while fetching user: "+err)
// 	  	}
// 	  	if (!user) {
// 	  		return done(null, false, {message: 'Unable to login'});
// 	  	} else {
// 		      // Check if password matches
// 		      user.comparePassword(password, function(err, isMatch) {
// 		      	if (isMatch && !err) {
// 		      		return done(null, {username: username, fistname: 'Bob'});
// 		      	}
// 		      	else {
// 		      		return done(null, false, {message: 'Authentication failed. Passwords did not match.'});
// 		      	}
// 		      });
// 		  }
// 		})
// 	}
// 	));


// passport.serializeUser(function(user, done){
// 	done(null, user);
// })
// passport.deserializeUser(function(user, done){
// 	done(null, user);
// })

// Register
router.get('/', function(req, res){
	res.send('login screen');
});
// router.post('/', passport.authenticate('local'), function(req, res){
// 	console.log("local");
// 	res.json(req.user)
// });
/**
*@api {post} /login Login
*@apiName Login
*@apiGroup Authentication
*@apiParam {String} Username Name of user
*@apiParam {String} Password Password
*@apiSuccess {Object} Object containing username and JWT token
*@apiError NoAccessRight User is not authenticated
*/
router.post('/', function(req, res, next){
	let error = new Error("Authentication failed, user not found");
	error.status = 404;

	User.findOne({email: req.body.username}, function(err, user){
		if(err){
			console.log('Error with login'+err);
			next(err);
		}
		if(!user){
			console.log("Not logged in");
			next(error);
		}
		else{
			user.comparePassword(req.body.password, function(err, isMatch) {
				if (isMatch && !err) {
		      		// create the token
		      		let obj = {username: user.username, email: user.email, password: user.password};
		      		let token = jwt.sign(obj, config.secret, {expiresIn: 10080});
		      		res.json({ success: true, token: 'JWT ' + token, username: user.username, following: user.following });
		      	}
		      	else {
		      		next(error);
		      	}
		      });
		}
	});
});

module.exports = router;