const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const jwksClient = require('jwks-rsa');

const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

passport.use(new FacebookStrategy({
  clientID        : "603496006962121",
  clientSecret    : "c63a6f6f8189ed75b5958b2c0c0e7341",
  callbackURL     : "http://localhost:3000/facebook/callback"

}, function (accessToken, refreshToken, profile, done) {

  console.log("email",accessToken );
  return done(null, profile);
}
));



mongoose.connect("mongodb://localhost/test-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => console.log("DB connected"));
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  token: String,
  apple_id: String,
});

const User = mongoose.model("User", userSchema);


app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
app.get('/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/profile',
			failureRedirect : '/'
    }));
    
    app.get('/profile',(req,res) => {
      res.send("you are authenticated")
  })

  app.get('/',(req,res) => {
    res.render("index")
})

app.listen(3000, () => console.log("server is running on port 3000"));
