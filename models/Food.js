
var mongoose = require('mongoose');

var constituentSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true
  },
  amount : {
    type : Number,
    required : true
  }
});

var foodSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true
  },
  isVegan : {
    type : Boolean
  },
  isVegetarian : {
    type : Boolean
  },
  isGlutenFree : {
    type : Boolean
  },
  caloriePerServing : {
    type : Number,
    required : true
  },
  servingSize : {
    type : Number,
    required : true
  },
  composition : [constituentSchema],
  onMenu : {
    type : Boolean,
    required : true
  }
});

var Food = mongoose.model('Food', foodSchema);

module.exports = Food;
