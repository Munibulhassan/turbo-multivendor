const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
app.use(bodyParser.json());
const mongoose = require("mongoose");

//Datbase connection
const MONGOurl = process.env.MONGOURL
mongoose.connect(
  MONGOurl,
  {
    useNewUrlParser: true,
  },
  (err, data) => {
    if (!err) {
      console.log("Database Successfully connected");
    } else {
      console.log(err);
    }
  }
);
//routes
const route = require("./routes/routes");
//Routing
app.use("/api", route);


app.use(function (req, res, next) {
  
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));



///login with google
const session = require('express-session');
const passport = require('passport');
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));
app.use(passport.initialize());
app.use(passport.session());
///
///google
const user = require("./models/auth");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
      passReqToCallback : true
    },
    function (request, accessToken, refreshToken, profile, done) {      
      user.findOne({ googleId: profile?.id }).then((existingUser) => {
        
        if (existingUser) {
          return done(null, existingUser);
        } else {
          var result = "";
          var characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          var charactersLength = characters.length;
          for (var i = 0; i < 5; i++) {
            result += characters.charAt(
              Math.floor(Math.random() * charactersLength)
            );
          }
          new user({
            googleId: profile.id,
            first_name: profile._json.given_name,
            last_name: profile._json.family_name,
            is_email_verify:true,
            email: profile.emails[0].value,
            provider: "google",
            referal_code: result,
          })
            .save()
            .then((user) => done(null, user));
        }
      });
    }
  )
);
///facebook
const facebookStrategy = require("passport-facebook").Strategy;
passport.use(
  new facebookStrategy(
    {
      // pull in our app id and secret from our auth.js file
      
      clientID: process.env.FACEBOOK_CLIENTID ,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: "http://localhost:5000/api/auth/facebook/callback",
    }, // facebook will send back the token and profile
    function (token, refreshToken, profile, done) {
      if (profile.emails === undefined) {
        done('email-required')
        return;
    }
      


      user.findOne({ facebookId: profile.id }).then((existingUser) => {
        if (existingUser) {
          return done(null, profile);
        } else {
          var result = "";
          var characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          var charactersLength = characters.length;
          for (var i = 0; i < 5; i++) {
            result += characters.charAt(
              Math.floor(Math.random() * charactersLength)
            );
          }

          new user({
            facebookId: profile.id,
            first_name: profile?.displayName?.split(" ")[0],
            last_name: profile?.displayName?.split(" ")[1],
            email: profile?.emails ? profile?.emails[0]?.value: "",
            provider: "facebook",
            own_ref_code: result,
          })
            .save()
            .then((user) => done(null, user));
        }
      });
    }
  )
);
///

require('./index')





app.set('view engine', 'ejs');

app.get('/success', (req, res) => res.send("You are a valid user"));
app.get('/error', (req, res) => res.send("error logging in"));

//server initialize
const url = process.env.PORT || 5000;
app.listen(url, () => {
  console.log("Server is Running on port " + url);
});
