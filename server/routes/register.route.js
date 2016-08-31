var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require('fs');
var sharp = require('sharp');

var path = require('path');
var appDir = path.dirname(require.main.filename);

var User = require(appDir+'/server/models/user.js');


// Register
router.get('/', function(req, res){
	res.send('register dsf');
})
router.post('/', function(req, res){
	var user = new User();
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
				return res.status(500).send(data.err.message);
			}
		});
});


module.exports = router;