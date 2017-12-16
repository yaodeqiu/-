var mongodb = require('./db');
function User(user) {
    this.username = user.username;
    this.password = user.password;
}
module.exports = User;
User.prototype.save = function(callback){
    var user = {
        username:this.username,
        password:this.password
    }
    mongodb.open(function (err,db) {
        if(err){
            return callback(err)
        }
        db.collection('users',function (err,collection) {
            if(err){
                mongodb.close()
                return callback(err)
            }
            collection.insert(user,function(err,user){
                mongodb.close()
                if(err){
                    return callback(err)
                }
                return callback(null,user[0])
            })
        })
    })
}
User.get= function(username,callback){
    mongodb.open(function (err,db) {
        if(err){
            return callback(err)
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close()
                return callback(err)
            }
            collection.findOne({username:username},function (err,user) {
                mongodb.close()
                if(err){
                    return callback(err)
                }
                return callback(null,user)
            })
        })
    })
}