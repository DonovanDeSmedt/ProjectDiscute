const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypteo = require('crypto');


var Schema = mongoose.Schema;

var userSchema = new Schema({
	email: {type: String, required: true, set: toLower},
	username: {type: String, required: true, set: toLower},
	password: {type: String, required: true},
  following: [String],
  followers: [String]
}, {collection: 'users'});

// userSchema.pre('save', function(next){
//   var user = this ;
//   var message;
//   // If username of email exist, throw error
//   User.find({$or: [{username: user.username},{email: user.email}]},function(err, users){
//     if(err) {
//       return next(err);
//     } else if(users.length) {
//     	users.forEach(function(obj){
//     		if(obj.email === user.email){
//     			message = "email";
//     		}
//     		if(obj.username === user.username){
//     			message = "username";
//     		}
//     	})
//     	next( new Error(message));
//     }
//     else{
//       // Encrypt password
//       bcrypt.genSalt(10, function (err, salt) {
//         if (err) {
//           return next(err);
//         }
//         bcrypt.hash(user.password, salt, function(err, hash) {
//           if (err) {
//             return next(err);
//           }
//           user.password = hash;
//           next();
//         });
//       });
//     }   
//   })
// });
userSchema.methods.checkUnique = function(username, email, cb){
  var user = this ;
  var message;
  // If username of email exist, throw error
  User.find({$or: [{username: username},{email: email}]},function(err, users){
    if(err) {
      return next(err);
    } else if(users.length) {
      users.forEach(function(obj){
        if(obj.email === user.email){
          message = "email";
        }
        if(obj.username === user.username){
          message = "username";
        }
      });
      cb( {success: false, err :new Error(message)});
    }
    else{
      // Encrypt password
      bcrypt.genSalt(10, function (err, salt) {
        if (err) {
          return next(err);
        }
        bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) {
            return next(err);
          }
          user.password = hash;
          cb({success : true});
        });
      });
    }   
  });
}
userSchema.methods.setPassword = function(password){
  var salt = crypto.randomBytes(16).toString('hex');
  var hash = crypto.pbkdf2Sync(password, salt, 1000, 64).toString();
}
userSchema.methods.encryptPassword = function(email, cb){
  var user = this ;
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      cb({success : false, err: err});
    }
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        cb({success : false, err: err});
      }
      user.password = hash;
      cb({success : true});
    });
  });
}
userSchema.methods.checkUniqueUpdate = function(username, email, cb){
  var user = this ;
  var message;
  // If username of email exist, throw error
  User.find({$or: [{username: username},{email: email}]},function(err, users){
    if(err) {
      return next(err);
    } else if(users.length) {
      users.forEach(function(obj){
        if(obj.email === user.email){
          message = "email";
        }
        if(obj.username === user.username){
          message = "username";
        }
      });
      cb( {success: false, err :new Error(message)});
    }
    else{
      cb({success: true});
    }
  });
}
userSchema.methods.comparePassword = function(pw, cb) {
  bcrypt.compare(pw, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};


function toLower (v) {
  return v.toLowerCase();
}

var User = mongoose.model('User', userSchema);


module.exports = mongoose.model('User', userSchema);