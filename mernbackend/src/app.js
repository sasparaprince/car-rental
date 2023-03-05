const express = require("express");
require('dotenv').config()
const path = require("path");
var http = require('http');
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
require("./server/db/conn");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const { ppid } = require('process');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Register = require("./server/models/register");
const { log } = require("console");
const axios = require('axios');
const port = process.env.PORT || 3000;
const connectDB = require('./server/db/conn');
var Userdb = require('./server/models/model');

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
// const partials_path = path.join(__dirname, "../templates/partials");s

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "ejs");
app.set("views", templates_path);
// ejs.registerPartials(partials_path);


// mongodb connection
// connectDB();

app.use('/', require('./server/routes/router'))
app.get("/", (req, res) => {
    res.render("index")

    Userdb.find({}, function (err, user) {
        res.render("home", {
            startingContent: homeStartingContent,
            user: user
        });
    });
});

app.get("/showcaradmin", (req, res) => {
    // res.render("index")

    Userdb.find({}, function (err, user) {
        res.render("showcar", {
        
            car: user
        });
    });
});



app.get("/register", (req, res) => {
    res.render("register");

})

app.get("/login", (req, res) => {
    res.render("login");

})
app.get("/car", (req, res) => {
    res.render("car");
})
app.get("/admin", (req, res) => {
    res.render("admin");
})
app.get("/addcar", (req, res) => {
    res.render("add_car");
})
app.get("/update-car/:id", (req, res) => {

const requestedPostId = req.params.id;
    
    Userdb.findOne({_id: requestedPostId}, function(err, user){
        if (user) {
            console.log(user);
            res.render("update_car", {
                //   title: post.title,
                //   content: post.content
                name : user.name,
                price : user.price,
                seats : user.seats,
                description : user.description,
                fuelType: user.fuelType,
                id: user?._id
                });
        }else{
            console.log(err);
        }   
      });   
    // res.render("update_car");
})
app.get("/showcaradmin", (req, res) => {
    res.render("showcar");
})

//*************************************google authentication*************************************************************** */
app.use(session({
    secret: "oue little secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

// mongoose.set("useCreateIndex", true);

// const userSchema = new mongoose.Schema({
//     email: String,
//     password: String,
//     googleId: String,
//     secret: String
// });
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String,
    displayName: String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id)
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"

},
    //   function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    //     User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //       return cb(err, user);
    //     });
    //   }
    function (accessToken, refreshToken, profile, cb) {

        User.findOrCreate({ username: profile.id, googleId: profile.id, displayName: profile.displayName }, function (err, user) {
            return cb(err, user);
        });
    }
));

app.get("/auth/google",
    passport.authenticate('google', {
        successRedirect: '/', scope:
            ['https://www.googleapis.com/auth/userinfo.profile']
    })
);

app.get("/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/userlogin");
    });

app.get("/userlogin", function (req, res) {
    User.find({ "secret": { $ne: null } }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                console.log(foundUser)

                axios.get('http://localhost:3000/api/users')
                    .then(function (response) {
                        res.render('userlogin', { users: response.data, name: req.user.displayName });
                    })
                    .catch(err => {
                        res.send(err);
                    })
            }
        }
    });
});



//********************************************************************************************************** */




// create a new user in our database 

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                email: req.body.email,
                password: password,
                confirmpassword: cpassword,
            })

            const registered = await registerEmployee.save();

            res.status(201).render("login");

        } else {
            res.send("password are not matching ")
        }
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
})
// logoin check

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email });
        if (useremail.password === password) {
            res.status(201).render("userlogin", { name: useremail.firstname });
        }
        else {
            res.send("password are not matching")
        }

    }
    // console.log(`${email}and password is ${password}`);
    catch (error) {
        res.status(400).send("invalid Email")
    }


})

app.get("/car/:postId", function (req, res) {

    const requestedPostId = req.params.postId;

    Userdb.findOne({ _id: requestedPostId }, function (err, user) {
        if (user) {
            console.log(user);
            res.render("car", {
                //   title: post.title,
                //   content: post.content
                name: user.name,
                price: user.price,
                seats: user.seats,
                description: user.description,
                fuelType: user.fuelType
            });
        } else {
            console.log(err);
        }
    });
});



//     app.get('/car/:_id', function(req,res){

//         var query = { 'question' : req.params.id };
//         console.log(query);
//         console.log('query');

//        db.collection('english', function(err, collection) {

//            collection.findOne(query, function(err, item) {
//                console.log(err);
//                res.send(item);
//            });
//        });
//    });

app.listen(port, () => {
    console.log(`server is running at port no: ${port}`);
})
