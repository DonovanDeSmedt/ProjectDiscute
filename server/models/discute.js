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

DiscuteSchema.methods.vote= function(user, side, cb){
	const indexLeft = this.left.votes.indexOf(user);
	const indexRight = this.right.votes.indexOf(user);

	if(side === 'right'){
		if(indexRight < 0){
			this.right.votes.push(user);
                //Als zowel rechts als links gevoted werd zal de vorige vote geannuleerd worden
            if(indexLeft > -1){
              	this.left.votes.splice(indexLeft, 1);
            }
        }
        else{
            	this.right.votes.splice(indexRight, 1); 
        } 
    }
    if(side === 'left'){
      	if(indexLeft < 0){
       		this.left.votes.push(user)
       		if(indexRight > -1){
       			this.right.votes.splice(indexRight, 1); 
       		}	
       	}
       	else{
       		this.left.votes.splice(indexLeft, 1);	
       	}
    }
    this.save(cb(this));
}
    

DiscuteSchema.methods.comment= function(user, comment, side, cb){
	const newComment = {name: user, comment: comment};
	console.log(newComment);
	if(side === 'left'){
		this.left.comments.push(newComment);
	}
	if(side === 'right'){
		this.right.comments.push(newComment);
	}
	this.save(cb(this));
}
DiscuteSchema.methods.delete_comment = function(side, id, cb){
	if(side === 'left'){
		const comment = this.left.comments.find(e => e._id.toString() == id);
		this.left.comments.remove(comment);
	}
	if(side === 'right'){
		const comment = this.right.comments.find(e => e._id.toString() == id);
		console.log(comment);
		this.right.comments.remove(comment);
	}
	this.save(cb(this));
}


module.exports = mongoose.model('Discute', DiscuteSchema);