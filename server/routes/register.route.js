let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let fs = require('fs');
let sharp = require('sharp');

let path = require('path');
let appDir = path.dirname(require.main.filename);

let User = require(appDir+'/server/models/user.js');


// Register
router.get('/', function(req, res){
	res.send('register dsf');
})
/**
*@api {post} /register Register
*@apiName Register
*@apiGroup Authentication
*@apiParam {String} Username Name of user
*@apiParam {String} Email Email of user
*@apiParam {String} Password Password of user
*@apiError NoAccessRight User is not authenticated
*@apiError UserAlreadyExists The user with <code>email</code> or <code>username</code> already exists.
*/
router.post('/', function(req, res, next){
	let user = new User();
		user.email = req.body.email;
		user.username = req.body.username;
		user.password = req.body.password;
		user.checkUnique(req.body.username, req.body.email, function(data){
			console.log(data.success);
			if(data.success){
				user.save(function(err){
					if(err){
						console.log(err.message);
						return res.status(500).send(err.message);
					}
					res.send('success');
				});
			}
			else{
				console.log("email of username bestaat al");
				console.log(data.err);
				next(new Error(data.err.message));
			}
		});
});


module.exports = router;