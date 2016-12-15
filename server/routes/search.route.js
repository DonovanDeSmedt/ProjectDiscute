let express = require('express');
let router = express.Router();
let multer = require('multer');
let mongoose = require('mongoose');

let Grid = require('gridfs-stream');
let fs = require('fs');
let conn = mongoose.connection;
Grid.mongo = mongoose.mongo;



let path = require('path');
let appDir = path.dirname(require.main.filename);

let User = require(appDir+'/server/models/user.js');
let Discute = require(appDir+'/server/models/discute.js');




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
*@api {get} /search/orderBy/:sort/:index Get treningd discutes ordered
*@apiDescription Get ordered list of discutes per page  
*@apiName GetOrderedTrendingDiscutes
*@apiGroup Discute
*@apiParam {Number} Index Pagenumber
*@apiParam {String} Sort Order type (week/month/year/always)
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*/
router.get('/orderBy/:sort/:index', function(req, res, next){
	let amountToSkip = req.params.index * 21;
	let date = new Date();
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
*@api {get} /search/searchAndOrder/:search/:sort/:index Search and order
*@apiDescription Get ordered list of discutes by search per page
*@apiName GetDiscutesBySearchAndOrder
*@apiGroup Discute
*@apiParam {String} Search Searchterm
*@apiParam {String} Sort Order type (week/month/year/always)
*@apiParam {Number} Index Pagenumber
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*/
router.get('/searchAndOrder/:search/:sort/:index', function(req, res, next){
	let date = new Date();
	let amountToSkip = req.params.index * 21;
	switch(req.params.sort.toLowerCase()){
		case 'week': date = new Date(date.setDate(date.getDate() - 7)); break;
		case 'month': date = new Date(date.setMonth(date.getMonth() - 1)); break;
		case 'year': date = new Date(date.setYear(date.getYear() - 1)); break;
		case 'always': date = new Date(date.setYear(date.getYear() - 100)); break;
	}
	let name = req.params.search;
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
*@api {get} /search/search/:name/:index Search
*@apiDescription Get list of discutes by search
*@apiName GetDiscutesBySearch
*@apiGroup Discute
*@apiParam {String} Name Searchterm
*@apiParam {Number} Index Pagenumber
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*/
router.get('/:name/:index', function(req, res, next){
	let amountToSkip = req.params.index * 21;
	let name = req.params.name;
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
*@api {get} /search/tag/:name/:index Search by tag
*@apiDescription Get list of discutes by tag per page
*@apiName GetDiscutesByTag
*@apiGroup Discute
*@apiParam {String} Name Tag
*@apiParam {Number} Index Pagenumber
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*/
router.get('/tag/:name/:index', function(req, res, next){
	let amountToSkip = req.params.index * 21;
	Discute.find({ $text: { $search: req.params.name }}).sort({date: -1}).skip(amountToSkip).limit(21).exec(function(err, data){
		if(err){
			console.log("Error while fetching data from orderBy");
			next(err);
		}
		if(data){
			res.json({discutes: prepareDataToBeSend(data)});
		}
		else{
			res.status(500).send({message: "Something went wrong with orderBy"});
		}
	});
});
/**
*@api {get} /search/tag/:name/:index Search and order by tag
*@apiDescription Get ordered list of discutes by tag per page
*@apiName GetDiscutesByTagAndOrder
*@apiGroup Discute
*@apiParam {String} Tag Tag
*@apiParam {String} Sort Order type (week/month/year/always)
*@apiParam {Number} Index Pagenumber
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*/
router.get('/tagAndOrder/:tag/:sort/:index', function(req, res, next){
	let amountToSkip = req.params.index * 21;
	let date = new Date();
	switch(req.params.sort.toLowerCase()){
		case 'week': date = new Date(date.setDate(date.getDate() - 7)); break;
		case 'month': date = new Date(date.setMonth(date.getMonth() - 1)); break;
		case 'year': date = new Date(date.setYear(date.getYear() - 1)); break;
		case 'always': date = new Date(date.setYear(date.getYear() - 100)); break;
	}
	let name = req.params.tag;
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