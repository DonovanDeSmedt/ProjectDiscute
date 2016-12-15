let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let Grid = require('gridfs-stream');
let fs = require('fs');
let conn = mongoose.connection;
Grid.mongo = mongoose.mongo;
let sharp = require('sharp');
let cloudinary = require('cloudinary');


let path = require('path');
let appDir = path.dirname(require.main.filename);

let User = require(appDir+'/server/models/user.js');
let Discute = require(appDir+'/server/models/discute.js');
let gfs = Grid(conn.db);

/**
*@api {get} /user/:username Get data of user
*@apiDescription Get all data (username, email, list of discutes, followers, subscriptions) of user
*@apiName GetDataOfUser
*@apiGroup User
*@apiParam {String} Username Username
*@apiSuccess {Object} Json file containing all data of user.
*@apiError NoAccessRight User is not authenticated
*/
router.get('/:username', function(req, res, next){
	let findUser = User.findOne({username: req.params.username}, function(err, user){
		if(err){
			next(err);
		}
		if(!user){
			next(new Error('User not found'));
		}
		else{
			Discute.find({author: req.params.username}).sort({date: -1}).exec(function(err, discutes){
				if(err){
					console.log("get username error");
					console.log(err.message);
					next(new Error(err.message));
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
/**
*@api {put} /user/follow/:username Follow user
*@apiName FollowUser
*@apiGroup User
*@apiParam {String} Username Username
*@apiParam {String[]} Following List of following users
*@apiParam {String} ToFollow User which need to be followed.
*@apiError NoAccessRight User is not authenticated
*@apiError UsernotFound The <code>id</code> of user was not found.
*/
router.put('/follow/:username', function(req, res, next){
	User.findOne({username: req.params.username}, function(err, user){
		if(user){
			user.following = req.body.following;
			user.save(function(err){
				if(err){
					console.log(err);
					next(err);
				}
				else{
					User.findOne({username: req.body.userToFollow}, function(err, followingUser){
						if(followingUser){
							let index = followingUser.followers.indexOf(req.body.follower);
							if(index >= 0){
								followingUser.followers.splice(index, 1);
							}
							else{
								followingUser.followers.push(req.body.follower);
							}
							followingUser.save(function(err){
								if(err){
									console.log(err);
									next(err);
								}
								else{
									res.send(200);
								}
							})
						}
						else{
							return next(new Error('Something failed while updating following user'));
						}
					});
				}
			});
		}
		else{
			return next(new Error('Something failed while updating following user'));
		}
	})
})
/**
*@api {put} /user/profile_picture/:username Change profile picture
*@apiName FollowUser
*@apiGroup User
*@apiParam {String} Username Username
*@apiError NoAccessRight User is not authenticated
*@apiError UsernotFound The <code>id</code> of user was not found.
*/
router.put('/profile_picture/:username', function(req, res, next){
	let path = appDir+'/'+req.files[0].path;
	let fileName = req.params.username+'.profile';
	let readStream = fs.createReadStream(path);
	let transformer = sharp()
	.resize(100)
	.on('info', function(info) {
		console.log('Image height is ' + info.height);
	});

	let stream = cloudinary.uploader.upload_stream(function(result) {
		console.log(result);
		res.send("Succes");
	}.bind(this), { public_id: fileName } );


	let writeStreamDB = gfs.createWriteStream({
		filename: fileName
	});

	readStream.pipe(transformer).pipe(stream);

	// gfs.remove({filename: fileName}, function(err){
	// 	if(err){
	// 		console.log(err);
	// 	}
	// 	else{
	// 		readStream.pipe(transformer).pipe(writeStreamDB);
	// 	}
	// })
});
/**
*@api {put} /user/changePassword Change password
*@apiName ChangePassword
*@apiGroup Authentication
*@apiParam {String} Email Email
*@apiParam {String} CurrentPassword CurrentPassword
*@apiParam {String} NewPassword NewPassword
*@apiError NoAccessRight User is not authenticated
*@apiError UsernotFound The <code>id</code> of user was not found.
*/
router.put('/changePassword/', function(req, res, next){
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
							return next(new Error('Error while updating password'));
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
/**
*@api {put} /user/account/:email Change email
*@apiName ChangeEmail
*@apiGroup Authentication
*@apiParam {String} Email Current email
*@apiParam {String} Email New email
*@apiError NoAccessRight User is not authenticated
*@apiError UsernotFound The <code>id</code> of user was not found.
*/
router.put('/account/:email', function(req, res, next){
	let oldEmail = req.params.email;
	let newEmail = req.body.new;
	User.findOne({email: oldEmail},function(err, user){
		if(oldEmail !== newEmail){
			user.email = newEmail;
		}
		user.save(function(err){
			if(err){
				console.log(err);
				return next(err);
			}
			else{
				res.sendStatus(200);
			}
		});
	});
});
function prepareDataToBeSend(data){
	let discute = [];
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