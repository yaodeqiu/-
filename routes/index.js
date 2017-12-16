var User = require('../model/User')
var Student = require('../model/Student')
function  checkLogin(req,res,next) {
    if(!req.session.user){
        req.flash('error','请先登录')
        return res.redirect('/login')
    }
    next()
}
module.exports = function (app) {
    app.get('/',function (req,res) {
        var page = parseInt(req.query.page) || 1;
        Student.findFive(null,page,function (err,students,total) {
            var counts= Math.ceil(total / 3)
            var isFristpage = page-1;
                if (isFristpage < 2){
                    isFristpage = 1
                }
            var isLastpage = page +1;
                if(isLastpage > counts){
                    isLastpage = counts
                }
            console.log(isLastpage)
            if(err){
                req.flash('error',err)
                return res.redirect('/')
            }
            return res.render('index',{
                title:'首页',
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString(),
                students:students,
                total:total,
                page:page,
                isFristpage:isFristpage,
                isLastpage:isLastpage,
                counts:counts
            })
        })
    })
    app.get('/login',function (req,res) {
        res.render('login',{
            title:"请登录",
            success:req.flash('success').toString(),
            error:req.flash('error').toString(),
            user:req.session.user
        })
    })
    app.post('/login',function (req,res) {
        User.get(req.body.username,function (err,user) {
            if(err){
                req.flash('error',err)
                return res.redirect('/login')
            }
            if(!user){
                req.flash('error','用户名不存在')
                return res.redirect('/register')
            }
            if(user.password != req.body.password){
                req.flash('error','密码错误')
                return res.redirect('/login')
            }
            req.flash('success','登录成功')
            req.session.user = user
            return res.redirect('/')
        })
    })
    app.get('/register',function (req,res) {
        res.render('register',{
            title:"注册",
            success:req.flash('success').toString(),
            error:req.flash('error').toString(),
            user:req.session.user
        })
    })
    app.post('/register',function (req,res) {
        var username = req.body.username;
        var password = req.body.password;
        var repassword  = req.body.repassword;
        if(password != repassword){
            req.flash('error','两次密码不一致');
            return res.redirect('/register');
        }
        if(username.trim() == '' || password.trim() == ''){
            req.flash('error','用户名或密码不能为空')
            return res.redirect('/register');
        }
        var newUser  = new User({
            username:username,
            password:password,
        })
        User.get(newUser.username,function(err,user){
            if(err){
                req.flash('error',err);
                return res.redirect('/register');
            }
            if(user){
                req.flash('error','用户名已存在');
                return res.redirect('/register');
            }
            newUser.save(function(err,user){
                if(err){
                    req.flash('error',err)
                    return res.redirect('/register')
                }
                req.session.user = newUser;
                console.log(req.session.user)
                req.flash('success','注册成功,请登录');
                return res.redirect('/login')
            })
        })
    })
    app.get('/logout',function (req,res) {
        req.session.user = null
        req.flash('error','退出成功')
        res.redirect('back')
    })
    app.get('/add',checkLogin,function (req,res) {
        res.render('add',{
            title:"信息新增",
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString(),
        })
    })
    app.post('/add',function (req,res) {
        console.log(req.body.name)
        console.log(req.body.gender)
        var name = req.body.name
        var gender = req.body.gender
        var major = req.body.major
        var email =req.body.email

        var newStudent = new Student(name,gender,major,email)
        console.log(newStudent.name)
        newStudent.save(function(err,students){
            if(name == '' || email == ''){
                req.flash('error','请输入相关内容')
                return res.redirect('/add')
            }
            if(err){
                req.flash('error',err)
                return res.redirect('back')
            }
            req.flash('success','添加成功')
            return res.redirect('/')
        })
    })
    app.get('/remove/:name/:time',checkLogin,function (req,res) {
        var id = req.params.name
        var time = req.params.time
        Student.remove(id,time,function (err) {
            if(err){
                req.flash('error','err')
                return res.redirect('/')
            }
            req.flash('success','删除成功')
            return res.redirect('/')
        })
    })
    app.get('/removeAll',checkLogin,function (req,res) {
        Student.removeAll(function (err) {
            if(err){
                req.flash('error','err')
                return res.redirect('/')
            }
            req.flash('success','清空成功')
            return res.redirect('/')
        })
    })
    app.get('/update/:name/:time',checkLogin,function (req,res) {
        Student.findOne(req.params.name,req.params.time,function (err,student) {
            if(err){
                req.flash('error',err)
                return res.redirect('back')
            }
            return res.render('update',{
                title:"更新页面",
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString(),
                student:student
            })
        })
    })
    app.post('/update/:name/:time',checkLogin,function (req,res) {
        var name = req.params.name
        var time = req.params.time
        var content = {
            name:name,
            email:req.body.email,
            major:req.body.major,
            gender:req.body.gender
        }
        Student.update(name,time,content,function (err,student) {
            if(err){
                req.flash('error',err)
                return res.redirect('back')
            }
            req.flash('success','修改成功')
            return res.redirect('/')
        })
    })
    app.get('/search',function (req,res) {
        var keyword = req.query.searchname
        console.log(keyword)
        Student.search(keyword,function (err,students) {
            if(keyword.trim() == ''){
                req.flash('error','请输入正确的相关搜索信息')
                return res.redirect('/')
            }
            if(err){
                req.flash('error','查询失败')
            }
            console.log(students)
            return res.render('search',{
                title:'搜索结果页面',
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString(),
                students:students
            })
        })
    })
}
