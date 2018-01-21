var express = require("express"),
    app = express(),
    bodyParser=require("body-parser"),
   
    methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
 mongoose=require("mongoose"),
 flash = require("connect-flash"),
    passport = require("passport"),
    localStrategy=require("passport-local"),
    User = require("./models/user"),
    Resource = require("./models/resource")
    
    
app.use(expressSanitizer());
app.use(methodOverride("_method"));
//mongodb://<vrkarthik>:<dbpassword>@ds111078.mlab.com:11078/competetive
mongoose.connect("mongodb://vrkarthik:Abc.543210@ds111078.mlab.com:11078/competetive");
//mongodb://<codex>:<Abc.543210>@ds111078.mlab.com:11078/competetive
app.set("view engine","ejs");       
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(flash());

app.use(require("express-session")({
    secret:"colt rocks",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req,res,next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});





app.get("/",function (req,res) {
   
    res.render("landingpage");
});

// var user;
// user = {
//   user:"karthik",
//   rem:"kat",
//   rew:{
//       git:"asdf",
//       aasd:"afsd"
//   },
//   ews:{
//       iut:"vas",
//       jit:"asdf"
//   }
// };
// app.get("/eks",function(req, res) {
//   res.send(user); 
// });


app.get("/exams",function(req, res) {
    Resource.find({},function (err,allResource) {
        if(err){
            console.log(err);
            
        }else{
            //  console.log(allResource);
             res.render("index",{resources:allResource});
        }
    })
  
});
app.get("/exams/new",isLoggedIn, function(req, res){
    res.render("new");
});


app.post("/exams", function(req, res){
    var title = req.body.resource.title;
    var image = req.body.resource.image;
    var link = req.body.resource.link;
    var body = req.body.resource.body;
    var author = {
        id:req.user.id,
        username:req.user.username
    }
    var newResource = {title:title,image:image,link:link,body:body,author:author};
    
    Resource.create(newResource, function(err, newResource){
        if(err){
            res.redirect("/exams/new");
        } else {
            
            res.redirect("/exams");
        }
    });
});

app.get("/exams/:id", function(req, res){
   Resource.findById(req.params.id, function(err, foundResource){
       if(err){
           res.redirect("/exams");
       } else {
           res.render("show", {resource:  foundResource});
       }
   });
});


app.get("/exams/:id/edit",checkResourceOwnership, function(req, res){
    Resource.findById(req.params.id, function(err, foundResource){
        if(err){
            res.redirect("/exams");
        } else {
            res.render("edit", {resource: foundResource});
        }
    });
});

app.put("/exams/:id", function(req, res){
    req.body.resource.body = req.sanitize(req.body.resource.body)
   Resource.findByIdAndUpdate(req.params.id, req.body.resource, function(err, updatedResource){
      if(err){
          res.redirect("/exams");
      }  else {
          res.redirect("/exams/" + req.params.id);
      }
   });
});
app.delete("/exams/:id",checkResourceOwnership, function(req, res){
   
   Resource.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/exams");
       } else {
           res.redirect("/exams");
       }
   })
   
});








app.get("/register",function(req, res) {
   res.render("register"); 
});



app.post("/register",function (req,res) {
    var newuser = new User({username:req.body.username});
    User.register(newuser,req.body.password,function (err,user) {
        if(err){
            console.log(err);
           return res.render("register.ejs");
        }
        passport.authenticate("local")(req,res,function () {
            res.redirect("/exams");
        });
    });
});

app.get("/login",function(req, res) {
   res.render("login"); 
});


app.post("/login",passport.authenticate("local",
      {
          successRedirect:"/exams",
          failureRedirect:"/login"
     }),
       function (req,res) {
    
});

app.get("/logout",function(req, res) {
   req.logout ();
   req.flash("success","logged you out.")
   res.redirect("/exams");
});


  function checkResourceOwnership (req,res,next) {
    
    if(req.isAuthenticated()){
        Resource.findById(req.params.id,function (err,foundResource) {
        if(err){
            res.redirect("back");
        }else{
          if(foundResource.author.id.equals(req.user._id)){
                next();
          }else{
             
              res.redirect("back");
             // alert("You are not owner");
          }
           
        }
    });

    }else{
        
        res.redirect("back");
    }

}


  function isLoggedIn (req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Please Login First");
    res.redirect("/login");
}


app.listen(process.env.PORT,process.env.IP,function () {
   
    console.log("server is set");
});