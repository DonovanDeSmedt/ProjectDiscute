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
var request = require('request');

const googleImages = require('google-images');
let client = googleImages('003106477553452423594:u079irgnvfa', 'AIzaSyB8Dx3x8VUF9nIt4y8O8riNHOuTmszL4RI');

/**
*@api {get} /picture/:imgName Get picture from url
*@apiName GetPictureFromUrl
*@apiGroup Picture
*@apiParam {String} Imagename Imagename
*@apiError NoAccessRight User is not authenticated
*@apiError Imagename The <code>imagename</code> was not found.
*/
router.get('/:imgName', function(req, res){
	res.writeHead(200, {'Content-Type': 'image/jpeg'});
	gfs.createReadStream({
		filename: req.params.imgName
	}).pipe(res);
});
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
		console.log(err)
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
/**
*@api {get} /picture/profile/:profileName Get profilepicture from db
*@apiName GetProfilePicture
*@apiGroup Picture
*@apiParam {String} Profilename Profilename
*@apiError NoAccessRight User is not authenticated
*/
router.get('/profile/:profileName', function(req, res, next){
	gfs.exist({filename: req.params.profileName}, function(err, found){
		if(err){
			console.log(err);
			next(err);
		}
		else{
			if(found){
				gfs.createReadStream({
					filename: req.params.profileName
				}).pipe(res);
			}
			else{
				console.log("not found");
				fs.readFile(appDir+'/client/images/user3.png', function(err, data){
					if(err){
						console.log(err);
					}
					else{
						res.writeHead(200, {'Content-Type': 'image/jpeg'});
						res.end(data); 
					}
				});
			}
		}
	});
	
})

module.exports = router;