const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DiscuteSchema = new Schema({
	title: {type: String},
	left: {
		picture: {
			fileName: String,
			extension: String
		},
		title: String,
		votes: [ String ],
		comments: [{ name: String, comment: String }],
	},
	right: {
		picture: {
			fileName: String,
			extension: String
		},
		title: String,
		votes: [ String ],
		comments: [{ name: String, comment: String }],
	},
	date:{type: Date, default: Date.now},
	author: {type: String},
	profilePicture: {type: Buffer},
	description: {type: String},
	tags: [String]
}, {collection: 'discutes'});

DiscuteSchema.methods.vote= function(left, right, cb){
	this.left.votes = left;
	this.right.votes = right;
	this.save(cb);
}
DiscuteSchema.methods.comment= function(left, right, cb){
	this.left.comments = left;
	this.right.comments = right;
	this.save(cb);
}


module.exports = mongoose.model('Discute', DiscuteSchema);