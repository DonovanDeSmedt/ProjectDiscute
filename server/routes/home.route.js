var express = require('express');
var router = express.Router();
var multer = require('multer');
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


router.param('discute_id', function(req, res, next, id){
	var query = Discute.findById(id);
	query.exec(function (err, discute) {
		if (err) { return next(err); }
		if (!discute) { return next(new Error("Can't find discute")); }

		req.discute = discute;
		return next();
	});
})
/**
*@api {post} /api/new/ Post new discute object
*@apiName PostDiscute
*@apiGroup Discute
*@apiParam {String} filenameLeft Name discute left.
*@apiParam {String} filenameRight Name discute right.
*@apiParam {String} fileExtensionLeft Extension image left.
*@apiParam {String} fileExtensionRight Extension image right.
*@apiParam {String} pathImageLeft Path image left.
*@apiParam {String} pathImageRight Path image right.
*@apiError NoAccessRight User is not authenticated
*/
router.post('/new', function(req, res, next){
	var fileNameLeft = req.body.author +  new Date().getTime();
	var fileNameRight = req.body.author +  (new Date().getTime() + 1);
	var fileExtensionLeft = req.files[0].mimetype;
	var fileExtensionRight = req.files[1].mimetype;
	var pathReadLeft = appDir+'/'+req.files[0].path;
	var pathReadRight = appDir+'/'+req.files[1].path;
	var result = 0;
	// Local streams 
	var readStreamLocalLeft = fs.createReadStream(pathReadLeft);
	var readStreamLocalRight = fs.createReadStream(pathReadRight);

	// DB streams
	var writeStreamDBLeft = gfs.createWriteStream({
		filename: fileNameLeft
	});
	var writeStreamDBRight = gfs.createWriteStream({
		filename: fileNameRight
	});
	var transformer = sharp()
	.resize(400)
	.on('info', function(info) {
		console.log('Image height is ' + info.height);
	});
	var transformer1 = sharp()
	.resize(400)
	.on('info', function(info) {
		console.log('Image height is ' + info.height);
	});
	readStreamLocalLeft.pipe(transformer).pipe(writeStreamDBLeft);
	readStreamLocalRight.pipe(transformer1).pipe(writeStreamDBRight);


	writeStreamDBLeft.on('close', function(file){
		console.log(file.filename+" written to db");
		result++;
		if(result === 3){
			res.send("Succes");
		}
	})
	writeStreamDBRight.on('close', function(file){
		console.log(file.filename+" written to db");
		result++;
		if(result === 3){
			res.send("Succes");
		}
	})
	var discute = new Discute();
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
*@api {get} /api/:username/:index Get discutes of subscribtions
*@apiName GetDiscute
*@apiGroup Discute
*@apiParam {String} Username Name of user
*@apiParam {Number} Pagenumber Pagenumber
*@apiDescription Get latest discutes of your subscribtions per page.
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*@apiError UserNotFound The <code>id</code> of the User was not found.
*/
router.get('/:username/:index', function(req, res, next){
	var amountToSkip = req.params.index * 12;
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
*@api {delete} /api/:id Delete discute
*@apiName DeleteDiscute
*@apiGroup Discute
*@apiParam {Number} Id Id of discute
*@apiError NoAccessRight User is not authenticated
*@apiError DiscuteNotFound The <code>id</code> of the discute was not found.
*/
router.delete('/:discute_id', function(req, res, next){	
		var discute = req.discute;
		var picLeft = discute.left.picture.fileName;
		var picRight = discute.right.picture.fileName;

		gfs.files.find({filename: picLeft}).toArray(function(err, files){
			gfs.db.collection('fs.chunks').remove({files_id: files[0]._id}, function(err) {
				gfs.remove(files[0], function (err) {
					if (err) return handleError(err);
				});
			});
		});
		
		gfs.files.find({filename: picRight}).toArray(function(err, files){
			gfs.db.collection('fs.chunks').remove({files_id: files[0]._id}, function(err) {
				gfs.remove(files[0], function (err) {
					if (err) return handleError(err);
				});
			});
			
		});
		discute.remove(function(err){
			if(err){
				next(err);
			}
			res.send(200);
		});
});
/**
*@api {get} /api/discute/findById/:id Get discute by id
*@apiName FindDiscuteById
*@apiGroup Discute
*@apiParam {Number} Id Id of discute
*@apiSuccess {Object} Discute discute object.
*@apiError NoAccessRight User is not authenticated
*@apiError DiscuteNotFound The <code>id</code> of the discute was not found.
*/
router.get('/discute/findById/:discute_id', function(req, res){
	res.json({discute: prepareDataToBeSend([req.discute])});
});
/**
*@api {get} /api/:index Get trending discutes
*@apiName GetTrendingDiscutes
*@apiGroup Discute
*@apiDescription Get latest discutes per page.
*@apiParam {Number} Pagenumber Pagenumber
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*@apiError DiscuteNotFound The <code>id</code> of the discute was not found.
*/
router.get('/:index', function(req, res, next){
	var amountToSkip = req.params.index * 21;
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
*@api {get} /api/orderBy/:sort/:index Get treningd discutes ordered
*@apiDescription Get ordered list of discutes per page  
*@apiName GetOrderedTrendingDiscutes
*@apiGroup Discute
*@apiParam {Number} Pagenumber Pagenumber
*@apiParam {String} Order Type order
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*/
router.get('/orderBy/:sort/:index', function(req, res, next){
	var amountToSkip = req.params.index * 21;
	var date = new Date();
	switch(req.params.sort.toLowerCase()){
		case 'week': date = new Date(date.setDate(date.getDate() - 7)); break;
		case 'month': date = new Date(date.setMonth(date.getMonth() - 1)); break;
		case 'year': date = new Date(date.setYear(date.getYear() - 1)); break;
		case 'always': date = new Date(date.setYear(date.getYear() - 100)); break;
	}
	Discute.aggregate(
		[       
		{
			$match: { date: { $gt: date } }
		},  
		{
			$project: {
				_id: 1,
				author: 1,
				description: 1,
				date: 1,
				tags: 1,

				left: {
					title: 1,
					votes: 1,
					comments: 1,
					picture: 1
				},
				right: {
					title: 1,
					votes: 1,
					comments: 1,
					picture: 1
				},
				size: {$add : [{ "$size": "$left.votes" }, { "$size": "$right.votes" }]}
			}
		},
		{ $sort: {"size": -1} },
		{ $skip: amountToSkip},
		{ $limit : 21 },
		{
			$project: {
				_id: 1,
				author: 1,
				description: 1,
				date: 1,
				tags: 1,
				left: {
					title: 1,
					votes: 1,
					comments: 1,
					picture: 1
				},
				right: {
					title: 1,
					votes: 1,
					comments: 1,
					picture: 1
				}
			}
		}
		], function(err, data){
			if(err){
				console.log("Error while fetching data from orderBy");
				next(err);
			}
			if(data){
				res.json({discutes: prepareDataToBeSend(data)});
			}
			else{
				res.send(500, {message: "Something went wrong with orderBy"})
			}
		});
});
/**
*@api {get} /api/searchAndOrder/:search/:sort/:index Search and order
*@apiDescription Get ordered list of discutes by search per page
*@apiName GetDiscutesBySearchAndOrder
*@apiGroup Discute
*@apiParam {String} Searchterm Searchterm
*@apiParam {String} Order Type order
*@apiParam {Number} Pagenumber Pagenumber
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*/
router.get('/searchAndOrder/:search/:sort/:index', function(req, res, next){
	var date = new Date();
	var amountToSkip = req.params.index * 21;
	switch(req.params.sort.toLowerCase()){
		case 'week': date = new Date(date.setDate(date.getDate() - 7)); break;
		case 'month': date = new Date(date.setMonth(date.getMonth() - 1)); break;
		case 'year': date = new Date(date.setYear(date.getYear() - 1)); break;
		case 'always': date = new Date(date.setYear(date.getYear() - 100)); break;
	}
	var name = req.params.search;
	Discute.aggregate(
		[       
		{
			$match: 
			{
				$and:
				[
				{date: {$gt: date}} ,
				{$or: [
					{"left.title": new RegExp(name, "i")},
					{"right.title": new RegExp(name, "i")},
					{"author": new RegExp(name, "i")}, 
					{"tags": new RegExp(name, "i")}
					]
				}
				]
			}
		},  
		{
			$project: {
				_id: 1,
				author: 1,
				description: 1,
				date: 1,
				tags: 1,

				left: {
					title: 1,
					votes: 1,
					comments: 1,
					picture: 1
				},
				right: {
					title: 1,
					votes: 1,
					comments: 1,
					picture: 1
				},
				size: {$add : [{ "$size": "$left.votes" }, { "$size": "$right.votes" }]}
			}
		},
		{ $sort: {"size": -1} },
		{ $skip: amountToSkip},
		{ $limit : 21 },
		{
			$project: {
				_id: 1,
				author: 1,
				description: 1,
				date: 1,
				tags: 1,
				left: {
					title: 1,
					votes: 1,
					comments: 1,
					picture: 1
				},
				right: {
					title: 1,
					votes: 1,
					comments: 1,
					picture: 1
				}
			}
		}
		], function(err, data){
			if(err){
				console.log("Error while fetching data from orderBy");
				next(err);
			}
			if(data){
				res.json({discutes: prepareDataToBeSend(data)});
			}
			else{
				res.send(500, {message: "Something went wrong with orderBy"})
			}
		});
});
/**
*@api {get} /api/search/:name/:index Search
*@apiDescription Get list of discutes by search
*@apiName GetDiscutesBySearch
*@apiGroup Discute
*@apiParam {String} Searchterm Searchterm
*@apiParam {Number} Pagenumber Pagenumber
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*/
router.get('/search/:name/:index', function(req, res, next){
	var amountToSkip = req.params.index * 21;
	var name = req.params.name;
	Discute.find(
		{$or: 
			[
			{"left.title": new RegExp(name, "i")},
			{"right.title": new RegExp(name, "i")}, 
			{"author": new RegExp(name, "i")}, 
			{"tags": new RegExp(name, "i")}
			]
		}).sort({date: -1}).skip(amountToSkip).limit(21).exec(function(err, data){
			if(err){
				console.log("Error while fetching data from orderBy");
				next(err);
			}
			if(data){
				res.json({discutes: prepareDataToBeSend(data)});
			}
			else{
				res.send(500, {message: "Something went wrong with orderBy"})
			}
		});
	});
/**
*@api {get} /api/tag/:name/:index Search by tag
*@apiDescription Get list of discutes by tag per page
*@apiName GetDiscutesByTag
*@apiGroup Discute
*@apiParam {String} Tag Tag
*@apiParam {Number} Pagenumber Pagenumber
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*/
router.get('/tag/:name/:index', function(req, res, next){
	var amountToSkip = req.params.index * 21;
	Discute.find({ $text: { $search: req.params.name }}).sort({date: -1}).skip(amountToSkip).limit(21).exec(function(err, data){
		if(err){
			console.log("Error while fetching data from orderBy");
			next(err);
		}
		if(data){
			res.json({discutes: prepareDataToBeSend(data)});
		}
		else{
			res.send(500, {message: "Something went wrong with orderBy"})
		}
	});
});
/**
*@api {get} /api/tag/:name/:index Search and order by tag
*@apiDescription Get ordered list of discutes by tag per page
*@apiName GetDiscutesByTagAndOrder
*@apiGroup Discute
*@apiParam {String} Tag Tag
*@apiParam {String} Order Type order
*@apiParam {Number} Pagenumber Pagenumber
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*/
router.get('/tagAndOrder/:tag/:sort/:index', function(req, res, next){
	var amountToSkip = req.params.index * 21;
	var date = new Date();
	switch(req.params.sort.toLowerCase()){
		case 'week': date = new Date(date.setDate(date.getDate() - 7)); break;
		case 'month': date = new Date(date.setMonth(date.getMonth() - 1)); break;
		case 'year': date = new Date(date.setYear(date.getYear() - 1)); break;
		case 'always': date = new Date(date.setYear(date.getYear() - 100)); break;
	}
	var name = req.params.tag;
	Discute.aggregate(
		[       
		{
			$match: 
			{
				$and: 
				[
				{date: {$gt: date}} ,
				{$text: { $search: name }}
				]

			}
		},  
		{
			$project: {
				_id: 1,
				author: 1,
				description: 1,
				date: 1,
				tags: 1,

				left: {
					title: 1,
					votes: 1,
					comments: 1,
					picture: 1
				},
				right: {
					title: 1,
					votes: 1,
					comments: 1,
					picture: 1
				},
				size: {$add : [{ "$size": "$left.votes" }, { "$size": "$right.votes" }]}
			}
		},
		{ $sort: {"size": -1} },
		{ $skip: amountToSkip},
		{ $limit : 21 },
		{
			$project: {
				_id: 1,
				author: 1,
				description: 1,
				date: 1,
				tags: 1,
				left: {
					title: 1,
					votes: 1,
					comments: 1,
					picture: 1
				},
				right: {
					title: 1,
					votes: 1,
					comments: 1,
					picture: 1
				}
			}
		}
		], function(err, data){
			if(err){
				console.log("Error while fetching data from orderBy");
				next(err);
			}
			if(data){
				res.json({discutes: prepareDataToBeSend(data)});
			}
			else{
				res.send(500, {message: "Something went wrong with orderBy"})
			}
		});
});
/**
*@api {put} /api/vote/:discute_id Vote for discute
*@apiName VoteDiscute
*@apiGroup Discute
*@apiParam {String} Username Name of the user who has voted
*@apiParam {Number} Id Id of discute
*@apiSuccess Data Votes and comments of both sides of the discute object
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
*@api {put} /api/commentdiscute/:discute_id Comment discute
*@apiName Comment
*@apiGroup Discute
*@apiParam {String} Username Name of the user who has commented
*@apiParam {String} Side Side of discute object(left/right)
*@apiParam {String} Comment Comment
*@apiParam {Number} Id Id of discute
*@apiSuccess Votes Comments of both sides
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
*@api {put} /api/new/discute/:discute_id Update discute
*@apiName Uncomment
*@apiGroup Discute
*@apiParam {String} Side Side of discute object(left/right)
*@apiParam {Number} Id Id of discute
*@apiParam {Number} Id Id of comment
*@apiSuccess Votes Comments of both sides
*@apiError NoAccessRight User is not authenticated
*@apiError DiscuteNotFound The <code>id</code> of the discute was not found.
*/
router.put('/uncomment/:discute_id', function(req, res, next){
	req.discute.delete_comment(req.body.side, req.body.id, function(data, err){
		if(err){ next(err);}
		res.json({
			left: {votes: data.left.votes, comments: data.left.comments},
		 	right: {votes: data.right.votes, comments: data.right.comments}
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