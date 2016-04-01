var api = require('express').Router();
var User   = require('../models/user'); // get our mongoose model
var Message = require('../models/message');

api.get('/message',function(req,res){
    Message.find({},function(err,msg){
        res.json({msg:msg,error:err});
    });
});

api.get('/',function(req,res){
    res.json({message:'Welcome to api'})
});

api.get('/setup',function(req,res){
    var admin = new User({
        name:'admin',
        password:'password',
        admin:true
    });

    admin.save(function(err){
        var success = err ? false : true;
        res.json({success:success,user:admin,error:err});
    })
});

api.get('/test',function(req,res){
    User.findOne({ name: 'admin' }, function(err, user) {
        if(user) {
            // test a matching password
            user.comparePassword('admin', function (err, isMatch) {
                if (err) throw err;
                console.log('admin:', isMatch); // -> admin: true
            });

            // test a failing password
            user.comparePassword('password', function (err, isMatch) {
                if (err) throw err;
                console.log('password:', isMatch); // -> Password: false
            });

            user.comparePassword('', function (err, isMatch) {
                if (err) throw err;
                console.log('nothing', isMatch); // -> '': false
            });
        }else{
            console.log('cannot find user');
        }
    });
    res.end('server test');
});


api.get('/users',function(req,res){
    User.find({},function(err,users){
        res.json({users:users});
    })
});

module.exports = api;