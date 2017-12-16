var mongodb  = require('./db')
var Student = function(name,gender,major,email){
    this.name =  name;
    this.gender = gender;
    this.major = major;
    this.email = email;
}
module.exports = Student
function formatDate(num) {
    return num < 10 ? '0'+num : num
}
Student.prototype.save = function (callback) {
    var date  = new Date();
    var now = date.getFullYear()+'-'+formatDate(date.getMonth()+1)+'-'+formatDate(date.getDate())+ " " +
        formatDate(date.getHours())+':'+formatDate(date.getMinutes())+':'+formatDate(date.getSeconds());
    var newStudent = {
        name : this.name,
        gender  : this.gender,
        major : this.major,
        email : this.email,
        time:now
    }
    mongodb.open(function (err,db) {
        if(err){
            return callback(err)
        }
        db.collection('students',function (err,collection) {
            if(err){
                mongodb.close()
                return callback(err)
            }
            collection.insert(newStudent,function (err,students) {
                mongodb.close()
                if(err){
                    return callback(err)
                }
                return callback(null,students)
            })
        })
    })
}
Student.findAll = function (name,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err)
        }
        db.collection('students',function (err,collection) {
            if(err){
                mongodb.close()
                return callback(err)
            }
            var query = {}
            if(name){
                query.name = name
            }
            collection.find(query).sort({time:-1}).toArray(function (err,students) {
                mongodb.close()
                if(err){
                    return callback(err)
                }
                return callback(null,students)
            })
        })
    })
}
Student.findOne = function (name,time,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err)
        }
        db.collection('students',function (err,collection) {
            if(err){
                mongodb.close()
                return callback(err)
            }
            collection.findOne({name:name,time:time},function (err,student) {
                mongodb.close()
                if(err){
                    return callback(err)
                }
                return callback(null,student)
            })
        })
    })
}
Student.findFive = function (name,page,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err)
        }
        db.collection('students',function (err,collection) {
            if(err){
                mongodb.close()
                return callback(err)
            }
            var query = {}
            if(name){
                query.name = name;
            }
            collection.count(query,function(err,total){
                if(err){
                    mongodb.close()
                    return callback(err)
                }
                collection.find(query,{
                    skip:(page-1)*3,
                    limit:3
                }).sort({time:-1}).toArray(function (err,students) {
                    mongodb.close();
                    if(err){
                        return callback(err)
                    }
                    return callback(null,students,total)
                })

            })
        })
    })
}
Student.remove  = function (name,time,callback) {
    mongodb.open(function (err,db) {
        if(err){
           return callback(err)
        }
        db.collection('students',function (err,collection) {
            if(err){
                mongodb.close()
                return callback(err)
            }
            collection.remove({name:name,time:time},function (err) {
                mongodb.close()
                if(err){
                    return callback(err)
                }
                return callback(null)
            })
        })
    })
}
Student.removeAll  = function (callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err)
        }
        db.collection('students',function (err,collection) {
            if(err){
                mongodb.close()
                return callback(err)
            }
            collection.remove({},function (err) {
                mongodb.close()
                if(err){
                    return callback(err)
                }
                return callback(null)
            })
        })
    })
}
Student.update = function (name,time,content,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err)
        }
        db.collection('students',function(err,collection){
            if(err){
                mongodb.close()
                return callback(err)
            }
            collection.update({
                name:name,
                time:time
            },{
                $set:{
                    name:content.name,
                    gender:content.gender,
                    major:content.major,
                    email:content.email
                }
            },function (err,student) {
                mongodb.close()
                if(err){
                    return callback(err)
                }
                return callback(null,student)
            })
        })
    })
}
Student.search = function (keyword,callback) {
    mongodb.open(function (err,db) {
        if(err){
            return callback(err)
        }
        db.collection('students',function (err,collection) {
            if(err){
                mongodb.close()
                return callback(err)
            }
            var newRegex = new RegExp(keyword,"i")
            collection.find({name:newRegex}).sort({time:-1}).toArray
            (function (err,students) {
                mongodb.close()
                if(err){
                    return callback(err)
                }
                return callback(null,students)
            })
        })
    })
}
