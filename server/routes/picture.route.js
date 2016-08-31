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


router.get('/:imgName', function(req, res){
	res.writeHead(200, {'Content-Type': 'image/jpeg'});
	gfs.createReadStream({
		filename: req.params.imgName
	}).pipe(res);

});
router.get('/profile/:profileName', function(req, res){
	gfs.exist({filename: req.params.profileName}, function(err, found){
		if(err){
			console.log(err);
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