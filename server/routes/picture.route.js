var express = require('express');
var router = express.Router();
var multer = require('multer');
var mongoose = require('mongoose');

var fs = require('fs');
var request = require('request');

const googleImages = require('google-images');
let client = googleImages('003106477553452423594:u079irgnvfa', 'AIzaSyB8Dx3x8VUF9nIt4y8O8riNHOuTmszL4RI');


/**
*@api {get} /picture/search/custom/:imageName Search picture using Google custom search
*@apiName GetPictureFromSearch
*@apiGroup Picture
*@apiParam {String} Imagename Imagename
*@apiSuccess {String} URL of local stored picture found through Google custom search
*@apiError NoAccessRight User is not authenticated
*@apiError SearchError Error while using the Google custom search
*/
router.get('/search/custom/:imageName', function(req, res, next){
	var imgName = req.params.imageName;
	var filename = imgName.replace(/\s/g, '') +  new Date().getTime()+'.png';
	client.search(imgName)
	.then(function (images) {
		var url = images[0].url;
		request(url).pipe(fs.createWriteStream('uploads/'+filename)).on('close', function(){
			res.send(filename);
		});
	}).catch(function(err){
		console.log(err);
		next(err);
	});
	// paginate results
	client.search(imgName, {
		page: 1
	});
	// search for certain size
	client.search(imgName, {
		size: 'large'
	});

});

module.exports = router;