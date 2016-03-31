var api = require('express').Router();
var User   = require('./users'); // get our mongoose model
var jwt    = require('jsonwebtoken');
var config = require('../bin/config'); // get our config file

api.get('/',function(req,res){
    res.json({message:'Welcome to api'})
})


api.post('/authenticate', function(req, res) {

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
                    console.log(isMatch)
                    if (isMatch) {
                        var token = jwt.sign(user, config.secret, {
                            expiresIn: 86400 // expires in 24 hours
                        });

                        // return the information including token as JSON
                        res.json({
                            success: true,
                            message: 'Enjoy your token!',
                            token: token
                        });
                    } else {
                        res.json({success: false, message: 'Authentication failed. Wrong password.'});
                    }
                });
                }else{
                    res.json({success:false,message: 'Password is required'})
                }
            }
    });
});

// route middleware to verify a token
api.use(function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                throw {status:403,message:'Failed to authenticate token.'}
               //return res.json({ success: false, message:  });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        throw {status:403,message:'No token provided.'} /*
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });*/

    }
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
})

api.get('/test',function(req,res){
    User.findOne({ name: 'admin' }, function(err, user) {
        var success = true;
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