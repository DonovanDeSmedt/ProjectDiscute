var express = require('express');
var router = express.Router();
var multer = require('multer');
var mongoose = require('mongoose');

var Grid = require('gridfs-stream');
var fs = require('fs');
var conn = mongoose.connection;
Grid.mongo = mongoose.mongo;



var path = require('path');
var appDir = path.dirname(require.main.filename);

var User = require(appDir+'/server/models/user.js');
var Discute = require(appDir+'/server/models/discute.js');




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
*@api {get} /search/orderBy/:sort/:index Get treningd discutes ordered
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
*@api {get} /search/searchAndOrder/:search/:sort/:index Search and order
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
*@api {get} /search/search/:name/:index Search
*@apiDescription Get list of discutes by search
*@apiName GetDiscutesBySearch
*@apiGroup Discute
*@apiParam {String} Searchterm Searchterm
*@apiParam {Number} Pagenumber Pagenumber
*@apiSuccess {Object[]} Discutes List of discute objects.
*@apiError NoAccessRight User is not authenticated
*/
router.get('/:name/:index', function(req, res, next){
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
*@api {get} /search/tag/:name/:index Search by tag
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
*@api {get} /search/tag/:name/:index Search and order by tag
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