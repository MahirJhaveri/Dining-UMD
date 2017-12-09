
var mongoose = require('mongoose');
var User = require('./User.js').User;
var userSchema = require('./User.js').userSchema;

var optionSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true
  },
  votes : {
    type : Number,
    required : true
  }
});

var pollSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true
  },
  title : {
    type : String,
    required : true
  },
  options : [optionSchema],
  usersTaken : [userSchema]
});

var Poll = mongoose.model('Poll', pollSchema);

module.exports = {
  Poll : Poll,
  pollSchema : pollSchema
};
