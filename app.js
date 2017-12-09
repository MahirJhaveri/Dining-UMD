
var express = require('express');
var exphbs = require('express-handlebars');
var logger = require('morgan');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Food = require('./models/Food.js');
const PORT = 3000;
const PASSWORD = "a";
var User = require('./models/User.js').User;
var Poll = require('./models/Poll.js').Poll;
var cookieParser = require('cookie-parser');

// Load envirorment variables
dotenv.load();
mongoose.connect(process.env.MONGODB, {useMongoClient : true});
mongoose.connection.on('error', function() {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
});

//Templating and Middleware
var app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
var hbs = exphbs.create({
  defaultLayout : 'main',
  helpers : {}
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));
app.use('/media', express.static('media'));


//Handling get and post requests
app.get('/', function(req, res){
  res.render('home');
})

app.get('/menu', function(req, res){
  Food.find({onMenu : true}, function(err, foods){
    if (err) throw err;
    res.render('foodList', {foods : foods});
  });
});

app.get('/food', function(req, res){
  Food.find({}, function(err, foods){
    if (err) throw err;
    res.render('foodList', {foods : foods});
  });
});

app.get('/food/:name', function(req, res){
  if(req.params.name === "Beef Burger"){
    //console.log("Beef Burger");
    res.render('beefBurger');
  }
  else{
     Food.findOne({name : req.params.name}, function(err, food){
       if (err) throw err;
       res.render('food', {food : food});
     });
  }
});

app.post('/removeAllFromMenu/:pwd', function(req, res){
  console.log(req.params.pwd);
  if(req.params.pwd === PASSWORD){
    Food.find({}, function(err, foods){
      if (err) throw err;
      foods.forEach(function(food){
        food.onMenu = false;
        food.save(function(err){
          if (err) throw err;
        });
      });
      res.send("Successfully removed all items from the menu.");
    });
  }
  res.send('404');
});

app.post('/addItemToMenu/:food/:pwd', function(req, res){
  if(req.body.pwd === PASSWORD){
    Food.find({name : req.body.food}, function(err, food){
      if (err) throw err;
      food.onMenu = true;
      food.save(function(err){
        if (err) throw err;
        res.send("Successfully removed all items from the menu.");
      });
    });
  }
  res.render('404');
});

app.post('/addPoll', function(req, res){
  var poll = new Poll({
    name : req.body.name,
    title : req.body.title,
    options : JSON.parse(req.body.options),
    usersTaken : []
  });
  poll.save(function(err) {
    if (err) throw err;
    return res.send('Succesfully inserted new poll.');
  });
});

app.post('/removePoll', function(req, res){});

app.post('/addUser', function(req, res){
  var user = new User({
    firstName : req.body.firstName,
    lastName : req.body.lastName,
    uid : req.body.uid
  });
  user.save(function(err) {
  if (err) throw err;
  return res.send('Succesfully inserted new user.');
  });
});

app.post('/takePoll/:uid', function(req, res){
  Poll.findOne({}, function(err, poll){
    User.findOne({uid : req.params.uid}, function(err, user){
      //console.log(req.body);
      poll.usersTaken.push(user);
      poll.options.forEach(function(option){
        if (option.name === req.body.food){
          option.votes++;
        }
      });
      poll.save(function(err){
        if (err) throw err;
        res.render('done');
      })
    })
  });
});

app.get('/pendingPolls/:uid', function(req, res){});

app.get('/login', function(req, res){
  res.render('login');
});

app.get('/poll', function(req, res){
  var id = req.cookies.uid;
  Poll.findOne({}, function(err, poll){
    if (err) throw err;
    if(!id){
      res.redirect('/login');
    }
    else{
      User.findOne({uid : id}, function(err, user){
        if (err) throw err;
        if(!alreadyVoted(poll, user)){
          res.render('poll', {user : user, poll : poll});
        }
        else{
          res.render('done');
        }
      });
    }
  });
});

app.post('/login', function(req, res){
  User.findOne({uid : req.body.uid}, function(err, user){
    if (err) throw err;
    if(!user){
      res.render('404');
    }
    else{
      res.cookie('logged in', true);
      res.cookie('uid', req.body.uid);
      res.redirect('/poll');
    }
  });
});

app.post('/food', function(req, res){
  console.log(req.body);
  var food = new Food({
    name : req.body.name,
    isVegan : req.body.isVegan,
    isVegetarian : req.body.isVegetarian,
    isGlutenFree : req.body.isGlutenFree,
    caloriePerServing : req.body.caloriePerServing,
    servingSize : req.body.servingSize,
    composition : JSON.parse(req.body.composition),
    onMenu : req.body.onMenu
  });
  food.save(function(err) {
  if (err) throw err;
  return res.send('Succesfully inserted food.');
  });
});

app.get('/logout', function(req, res){
  res.clearCookie("logged in");
  res.clearCookie("uid");
  res.render('loggedOut');
})

//Listening at port 3000
app.listen(PORT, function(){
  console.log(`Listening at port ${PORT}`);
});


//helper method

function alreadyVoted(poll, user){
  for(x in poll.usersTaken){
    if(poll.usersTaken[x].uid === user.uid){
      return true;
    }
  }
  return false;
}
