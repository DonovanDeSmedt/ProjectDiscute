var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');
var conn = mongoose.connection;
Grid.mongo = mongoose.mongo;
var sharp = require('sharp');

var path = require('path');
var appDir = path.dirname(require.main.filename);

var User = require(appDir+'/server/models/user.js');
var Discute = require(appDir+'/server/models/discute.js');
var gfs = Grid(conn.db);


router.get('/:username', function(req, res){
	var findUser = User.findOne({username: req.params.username}, function(err, user){
		if(err){
			throw err;
		}
		if(!user){
			res.status(500).send({ error: 'Something failed!' });
		}
		else{
			Discute.find({author: req.params.username}, function(err, discutes){
				if(err){
					console.log("get username error");
					console.log(err.message);
				}
				res.json({
					username: user.username,
					email: user.email,
					discutes : prepareDataToBeSend(discutes),
					followers: user.followers,
					following: user.following
				});
			});
		}
	});
});
router.put('/follow/:username', function(req, res){
	User.findOne({username: req.params.username}, function(err, user){
		if(user){
			user.following = req.body.following;
			user.save(function(err){
				if(err){
					console.log(err);
				}
				else{
					User.findOne({username: req.body.userToFollow}, function(err, followingUser){
						if(followingUser){
							var index = followingUser.followers.indexOf(req.body.follower);
							if(index >= 0){
								followingUser.followers.splice(index, 1);
							}
							else{
								followingUser.followers.push(req.body.follower);
							}
							followingUser.save(function(err){
								if(err){
									console.log(err);
								}
								else{
									res.send(200);
								}
							})
						}
						else{
							res.send(500).send({ error: 'Something failed while updating following user' });
						}
					});
				}
			});
		}
		else{
			res.send(500).send({ error: 'Something failed while updating following user' });
		}
	})
})
router.put('/profile_picture/:username', function(req, res){
	var path = appDir+'/'+req.files[0].path;
	var fileName = req.params.username+'.profile';
	var readStream = fs.createReadStream(path);
	var transformer = sharp()
	.resize(100)
	.on('info', function(info) {
		console.log('Image height is ' + info.height);
	});
	var writeStreamDB = gfs.createWriteStream({
		filename: fileName
	});

	gfs.remove({filename: fileName}, function(err){
		if(err){
			console.log(err);
		}
		else{
			readStream.pipe(transformer).pipe(writeStreamDB);
		}
	})
});
router.put('/changePassword/', function(req, res){
	User.findOne({email: req.body.email}, function(err, user){
		if(user){
			user.comparePassword(req.body.currentPassword, function(err, isMatch) {
				if(isMatch){
					user.password = req.body.password;
					user.encryptPassword(req.body.email,function(data){
						if(data.success){
							user.save(function(err){
								if(err){
									console.log(err);
								}
								else{
									res.json({success: true})
								}
							});
						}
						else{
							console.log("Error updating password");
						}
					});
				}
				else{
					res.json({success: false, message: "Current password incorrect"})
				}
			});
		}
	})
})
router.put('/account/:username', function(req, res){
	var oldUser = req.body.old;
	var newUser = req.body.new;
	User.findOne({$or: [{username: oldUser.username},{email: oldUser.email}]},function(err, user){
		if(oldUser.email !== newUser.email){
			user.email = newUser.email;
		}
		else{
			newUser.email = "";
		}
		if(oldUser.username !== newUser.username){
			user.username = newUser.username;
		}
		else{
			newUser.username = "";
		}

		user.checkUniqueUpdate(newUser.username,newUser.email, function(data){
			if(data.success){
				if(newUser.username !== ""){
					Discute.find({author: oldUser.username}, function(err, discutes){
						discutes.forEach(function(discute, index){
							discute.author = newUser.username;
							discute.save(function(err){
								if(err){
									console.log(err.message, discute);
								}
							})
						});
					});
				}
				user.save(function(err){
					if(err){
						console.log(err);
					}
					else{
						res.sendStatus(200);
					}
				})
			}
			else{
				return res.status(500).send(data.err.message);
			}
		});
	});
});
function prepareDataToBeSend(data){
	var discute = [];
	data.forEach(function(value, index){
		discute[index] = {};
		discute[index].right = {};
		discute[index].left = {};
		discute[index]._id = data[index]._id;
		discute[index].author = data[index].author;
		discute[index].date = new Date(data[index].date).toDateString();
		discute[index].tags = data[index].tags;
		discute[index].description = data[index].description;
		discute[index].right.picture = data[index].right.picture.fileName;
		discute[index].right.title = data[index].right.title;
		discute[index].right.votes = data[index].right.votes;
		discute[index].right.comments = data[index].right.comments;
		discute[index].left.picture = data[index].left.picture.fileName;
		discute[index].left.title = data[index].left.title;
		discute[index].left.votes = data[index].left.votes;
		discute[index].left.comments = data[index].left.comments;
		discute[index].left.picture = data[index].left.picture.fileName;
	});
	return discute;
}

module.exports = router;