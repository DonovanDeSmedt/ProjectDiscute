const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var discuteSchema = new Schema({
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

module.exports = mongoose.model('Discute', discuteSchema);