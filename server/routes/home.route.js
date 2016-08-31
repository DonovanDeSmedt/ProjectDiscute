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
router.post('/new', function(req, res){
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
		}
		result++;
		if(result === 3){
			res.send("Succes hhh");
		}
	})
});

router.get('/:username/:index', function(req, res){
	var amountToSkip = req.params.index * 12;
	User.findOne({username: req.params.username}, function(err, user){
		if(err){
			console.log("Error while fetching data");
			throw err;
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
router.delete('/:id', function(req, res){
	
	Discute.findById(req.params.id, function(err, discute){
		if(err){
			throw err;
		}
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
				throw err;
			}
			res.send(200);
		});
	})
})
router.get('/discute/findById/:id', function(req, res){
	Discute.find({_id: req.params.id}, function(err, data){
		if(err){
			console.log("Error while fetching data");
			throw err;
		}
		if(data){
			res.json({discute: prepareDataToBeSend(data)});
		}
	});
});
router.get('/:index', function(req, res){
	var amountToSkip = req.params.index * 21;
	Discute.find().sort({date: -1}).skip(amountToSkip).limit(21).exec(function(err, data){
		if(err){
			console.log("Error while fetching data");
			throw err;
		}
		if(data){
			res.json({discutes: prepareDataToBeSend(data)});
		}
	});
});
router.get('/orderBy/:sort/:index', function(req, res){
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
				throw err;
			}
			if(data){
				res.json({discutes: prepareDataToBeSend(data)});
			}
			else{
				res.send(500, {message: "Something went wrong with orderBy"})
			}
		});
});
router.get('/searchAndOrder/:search/:sort/:index', function(req, res){
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
				throw err;
			}
			if(data){
				res.json({discutes: prepareDataToBeSend(data)});
			}
			else{
				res.send(500, {message: "Something went wrong with orderBy"})
			}
		});
});
router.get('/search/:name/:index', function(req, res){
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
				throw err;
			}
			if(data){
				res.json({discutes: prepareDataToBeSend(data)});
			}
			else{
				res.send(500, {message: "Something went wrong with orderBy"})
			}
		});
	});
router.get('/tag/:name/:index', function(req, res){
	var amountToSkip = req.params.index * 21;
	Discute.find({ $text: { $search: req.params.name }}).sort({date: -1}).skip(amountToSkip).limit(21).exec(function(err, data){
		if(err){
			console.log("Error while fetching data from orderBy");
			throw err;
		}
		if(data){
			res.json({discutes: prepareDataToBeSend(data)});
		}
		else{
			res.send(500, {message: "Something went wrong with orderBy"})
		}
	});
});
router.get('/tagAndOrder/:tag/:sort/:index', function(req, res){
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
				throw err;
			}
			if(data){
				res.json({discutes: prepareDataToBeSend(data)});
			}
			else{
				res.send(500, {message: "Something went wrong with orderBy"})
			}
		});
});
router.put('/new/discute/:discute_id', function(req, res){
	Discute.findById(req.params.discute_id, function(err, discute){
		if(err){
			console.log(err);
		}
		discute.left.votes = req.body.left.votes;
		discute.right.votes = req.body.right.votes;
		discute.left.comments = req.body.left.comments;
		discute.right.comments = req.body.right.comments;
		discute.save(function(err){
			if(err){
				console.log(err);
			}
			res.send(200);
		})
	})
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