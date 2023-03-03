const express = require("express");
require('dotenv').config()
const path = require("path");
var http = require('http');
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
require("./db/conn");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const { ppid } = require('process');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Register = require("./models/register");
const { log } = require("console");
const port = process.env.PORT || 3000;
const connectDB = require('./db/conn');

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
// const partials_path = path.join(__dirname, "../templates/partials");s

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(static_path));
app.set("view engine", "ejs");
app.set("views", templates_path);
// ejs.registerPartials(partials_path);

app.get("/", (req, res) => {
    res.render("index")
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
    res.render("admin/addcar");
})
app.get("/updatecar", (req, res) => {
    res.render("admin/updatecar");
})
app.get("/showcaradmin", (req, res) => {
    res.render("admin/showcaradmin");
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
passport.authenticate('google', { successRedirect: '/',scope:
  [ 'https://www.googleapis.com/auth/userinfo.profile']})
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
                res.render("userlogin", { name:req.user.displayName});
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
/*********************************************************************************************** */
var schema = new mongoose.Schema({
    name : {
        type : String
    },
    price: {
        type: Number
    },
    fuelType : String,

    description: {
        type : String
    },
    seats: {
        type: Number
    }
})

const Userdb = mongoose.model('userdb', schema);

app.post("/api/users", async (req, res) => {
    // validate request
    if(!req.body){
        res.status(400).send({ message : "Content can not be emtpy!"});
        return;
    }

    // new user
    const user = new Userdb({
        name : req.body.name,
        price : req.body.price,
        seats : req.body.seats,
        description : req.body.description,
        fuelType: req.body.fuelType
        // status : req.body.status
    })

    // save user in the database
    user
        .save(user)
        .then(data => {
            // res.send(data)
            console.log(data);
            res.redirect('/addcar');
        })
        .catch(err =>{
            res.status(500).send({
                message : err.message || "Some error occurred while creating a create operation"
            });
        });

})


exports.homeRoutes = (req, res) => {
    // Make a get request to /api/users
    axios.get('http://localhost:3000/api/users')
        .then(function(response){
            res.render('index', { users : response.data });
        })
        .catch(err =>{
            res.send(err);
        })

    
}

/*********************************************************************************************** */


app.listen(port, () => {
    console.log(`server is running at port no: ${port}`);
})
