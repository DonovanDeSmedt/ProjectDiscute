let express = require('express');
let router = express.Router();
let multer = require('multer');
let mongoose = require('mongoose');

let Grid = require('gridfs-stream');
let fs = require('fs');
let conn = mongoose.connection;
Grid.mongo = mongoose.mongo;

let sharp = require('sharp');
let cloudinary = require('cloudinary');

let imagemin = require('image-min');
let path = require('path');
let appDir = path.dirname(require.main.filename);

let User = require(appDir+'/server/models/user.js');
let Discute = require(appDir+'/server/models/discute.js');


let gfs = Grid(conn.db);


router.param('discute_id', function(req, res, next, id){
	let query = Discute.findById(id);
	query.exec(function (err, discute) {
		if (err) { return next(err); }
		if (!discute) { return next(new Error("Can't find discute")); }

		req.discute = discute;
		return next();
	});
})
/**
*@api {post} /discute/new/ Post new discute object
*@apiName PostDiscute
*@apiGroup Discute
*@apiParam {String} Author Name of author.
*@apiParam {Object} Pictures Array of blob objects.
*@apiError NoAccessRight User is not authenticated.
*@apiError ParseError Object type not supported.
*/
router.post('/new', function(req, res, next){
	let fileNameLeft = req.body.author +  new Date().getTime();
	let fileNameRight = req.body.author +  (new Date().getTime() + 1);
	let fileExtensionLeft = req.files[0].mimetype;
	let fileExtensionRight = req.files[1].mimetype;
	let pathReadLeft = appDir+'/'+req.files[0].path;
	let pathReadRight = appDir+'/'+req.files[1].path;
	let result = 0;

	let url = {};
	// Local streams 
	let readStreamLocalLeft = fs.createReadStream(pathReadLeft);
	let readStreamLocalRight = fs.createReadStream(pathReadRight);

	// DB streams
	let writeStreamDBLeft = gfs.createWriteStream({
		filename: fileNameLeft
	});
	let writeStreamDBRight = gfs.createWriteStream({
		filename: fileNameRight
	});
	let transformer = sharp()
	.resize(400)
	.on('info', function(info) {
		console.log('Image height is ' + info.height);
	});

	let transformer1 = sharp()
	.resize(400)
	.on('info', function(info) {
		console.log('Image height is ' + info.height);
	});

	let minLeft = imagemin({ext:'jpg'});
	let minRight = imagemin({ext:'jpg'});



	let streamLeft = cloudinary.uploader.upload_stream(function(data) {
  		result++;
		if(result === 3){
			res.send("Succes");
		}
  	}.bind(this), { public_id: fileNameLeft } );

  	let streamRight = cloudinary.uploader.upload_stream(function(data) {
  		result++;
		if(result === 3){
			res.send("Succes");
		}
  	}.bind(this), { public_id: fileNameRight } );



	readStreamLocalLeft.pipe(minLeft).pipe(transformer).pipe(streamLeft);
	readStreamLocalRight.pipe(minRight).pipe(transformer1).pipe(streamRight);

	let discute = new Discute();
	discute.author = req.body.author;
	discute.left.picture.fileName = fileNameLeft;
	discute.right.picture.fileName = fileNameRight;
	discute.left.picture.extension = fileExtensionLeft;
	discute.right.picture.extension = fileExtensionRight;

	discute.left.title = req.body.left_title;
	discute.right.title = req.body.right_title;
	discute.description = req.body.description;
	discute.tags = req.body.tags.split(',');

	// discute.profilePicture = profilePicture;
	discute.save(function(err){
		if(err){
			console.log("Error while saving discute object");
			console.log(err.message);
			next(err);
		}
		result++;
		if(result === 3){
			res.send("Succes");
		}
	});
});
/**
*@api {get} /discute/:username/:index Get discutes of subscribtions
*@apiName GetDiscute
*@apiGroup Discute
*@apiParam {String} Username Name of user
*@apiParam {Number} Index Pagenumber
*@apiDescription Get latest discutes of your subscribtions per page.
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*@apiError UserNotFound The <code>id</code> of the User was not found.
*/
router.get('/:username/:index', function(req, res, next){
	let amountToSkip = req.params.index * 12;
	User.findOne({username: req.params.username}, function(err, user){
		if(err){
			console.log("Error while fetching data");
			next(err);
		}
		if(user){
			Discute.find({author: {$in: user.following}}).sort({date: -1}).skip(amountToSkip).limit(12).exec(function(err, data){
				if(err){
					console.log("Error while fetching data");
					throw err;
				}
				if(data){
					res.json({discutes: prepareDataToBeSend(data)});
				}
			});
		}
	})	
});
/**
*@api {delete} /discute/:id Delete discute
*@apiName DeleteDiscute
*@apiGroup Discute
*@apiParam {Number} Id Id of discute
*@apiError NoAccessRight User is not authenticated
*@apiError DiscuteNotFound The <code>id</code> of the discute was not found.
*/
router.delete('/:discute_id', function(req, res, next){	
		let discute = req.discute;
		let picLeft = discute.left.picture.fileName;
		let picRight = discute.right.picture.fileName;

		cloudinary.uploader.destroy(picLeft, function(result) { console.log(result) });
		cloudinary.uploader.destroy(picRight, function(result) { console.log(result) });

		discute.remove(function(err){
			if(err){
				next(err);
			}
			res.send(200);
		});
});
/**
*@api {get} /discute/findBy/id/:id Get discute by id
*@apiName FindDiscuteById
*@apiGroup Discute
*@apiParam {Number} Id Id of discute
*@apiSuccess {Object} Discute discute object.
*@apiError NoAccessRight User is not authenticated
*@apiError DiscuteNotFound The <code>id</code> of the discute was not found.
*/
router.get('/findBy/id/:discute_id', function(req, res){
	res.json({discute: prepareDataToBeSend([req.discute])});
});
/**
*@api {get} /discute/:index Get trending discutes
*@apiName GetTrendingDiscutes
*@apiGroup Discute
*@apiDescription Get latest discutes per page.
*@apiParam {Number} Index Pagenumber
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*@apiError DiscuteNotFound The <code>id</code> of the discute was not found.
*/
router.get('/:index', function(req, res, next){
	let amountToSkip = req.params.index * 21;
	Discute.find().sort({date: -1}).skip(amountToSkip).limit(21).exec(function(err, data){
		if(err){
			console.log("Error while fetching data");
			next(err);
		}
		if(data){
			res.json({discutes: prepareDataToBeSend(data)});
		}
	});
});
/**
*@api {put} /discute/vote/:discute_id Vote for discute
*@apiName VoteDiscute
*@apiGroup Discute
*@apiParam {String} Username Name of the user who has voted
*@apiParam {Number} Id Id of discute
*@apiSuccess {Object} Data Votes and comments of both sides of the discute object
*@apiError NoAccessRight User is not authenticated
*@apiError DiscuteNotFound The <code>id</code> of the discute was not found.
*/
router.put('/vote/:discute_id', function(req, res, next){
	req.discute.vote(req.body.user, req.body.side, function(data, err){
		if(err){ next(err);}
		res.json({
			left: {votes: data.left.votes, comments: data.left.comments},
		 	right: {votes: data.right.votes, comments: data.right.comments}
		});
	})
});
/**
*@api {put} /discute/comment/:discute_id Comment discute
*@apiName Comment
*@apiGroup Discute
*@apiParam {String} Username Name of the user who has commented
*@apiParam {String} Side Side of discute object(left/right)
*@apiParam {String} Comment Comment
*@apiParam {Number} Id Id of discute
*@apiSuccess {Object} Data Votes and comments of both sides of the discute object
*@apiError NoAccessRight User is not authenticated
*@apiError DiscuteNotFound The <code>id</code> of the discute was not found.
*/
router.put('/comment/:discute_id', function(req, res, next){
	req.discute.comment(req.body.user, req.body.comment, req.body.side, function(data, err){
		if(err){ next(err);}
		res.json({
			left: {votes: data.left.votes, comments: data.left.comments},
		 	right: {votes: data.right.votes, comments: data.right.comments}
		});
	})
});
/**
*@api {put} /discute/new/discute/:discute_id Update discute
*@apiName Uncomment
*@apiGroup Discute
*@apiParam {String} Side Side of discute object(left/right)
*@apiParam {Number} Id Id of discute
*@apiParam {Number} Id Id of comment
*@apiSuccess {Object} Data Votes and comments of both sides of the discute object
*@apiError NoAccessRight User is not authenticated
*@apiError DiscuteNotFound The <code>id</code> of the discute was not found.
*/
router.put('/uncomment/:discute_id', function(req, res, next){
	req.discute.deleteComment(req.body.side, req.body.id, function(data, err){
		if(err){ next(err);}
		res.json({
			left: {votes: data.left.votes, comments: data.left.comments},
		 	right: {votes: data.right.votes, comments: data.right.comments}
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