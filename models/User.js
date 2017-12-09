
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  firstName : {
    type : String,
    required : true
  },
  lastName : {
    type : String,
    required : true
  },
  uid : {
    type : Number,
    required : true
  }
});

var User = mongoose.model('User', userSchema);

module.exports = {
  User : User,
  userSchema : userSchema
}
