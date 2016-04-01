var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports

var MessageSchema = new Schema({
    msg: {type:String, required:true} ,
    user_id: {type: Schema.Types.ObjectId, ref: 'Users'},
    type: {type:Number,default:1}
},
{
    timestamps: true
});


module.exports = mongoose.model('Message', MessageSchema);