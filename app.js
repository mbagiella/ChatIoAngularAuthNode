var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./bin/config'); // get our config file
var api = require('./routes/api');
var mongoose = require('mongoose');
var jwt    = require('jsonwebtoken');
var User   = require('./models/user');
var Message   = require('./models/message');
var app = express();

app.io = require('socket.io')();


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/angular', express.static(__dirname + '/node_modules/angular/'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.post('/login',function(req,res){
  var token;
  var name = req.body.username;
  if(name){
    User.findOne({name:name},function(err,user){
      if(user){
        token = jwt.sign(user, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
        res.json({success:true,user:user,error:err,status:'found',token:token});
      }else{
        user = new User({name:name});
        user.save(function(err){
          var success = err ? false : true;
          token = jwt.sign(user, config.secret, {
            expiresIn: 86400 // expires in 24 hours
          });
          res.json({success:success,user:user,error:err,status:'saved',token:token});
        });
      }
    });
  }else {
    res.json({success: false, error: 'Name is required'})
  }
});

app.post('/authenticate', function(req, res) {
  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      if (req.body.password){
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (err) throw err;
          if (isMatch) {
            var token = jwt.sign(user, config.secret, {
              expiresIn: 86400 // expires in 24 hours
            });
            // return the information including token as JSON
            res.render('admin');
            console.log(token);
          } else {
            res.render('admin',{success: false, message: 'Authentication failed. Wrong password.'});
          }
        });
      }else{
        res.render('admin',{success:false,message: 'Password is required'})
      }
    }
  });
});

app.get('/',function(req,res){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {

      } else {
        req.decoded = decoded;
      }
    });
  }
  res.render('chat');
});

app.use('/api',api);

mongoose.connect(config.database);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.io.on('connection', function(socket){
  socket.broadcast.emit('chat',{msg:'a new user is connected',type:0});

  socket.on('chat', function(msg){
    var message = new Message({msg:msg.msg,user_id:msg._id});
    message.save(function(){
      socket.broadcast.emit('chat', msg);
    });
  });
});


module.exports = app;
