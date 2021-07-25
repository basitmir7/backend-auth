//const https = require("https");
//const http = require("http");
const https = require("https");

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../model/User");
const key = require("../config/keys").secret;

router.post("/register", (req, res) => {
  let { username, password, confirm_password, email } = req.body;
  if (password !== confirm_password) {
    return res.status(400).json({
      msg: "password do not match",
    });
  }

  //check for username

  User.findOne({ username: username }).then((user) => {
    if (user) {
      return res.status(400).json({
        msg: "username is already taken.",
      });
    }
  });
  //check for unique email

  User.findOne({ email: email }).then((user) => {
    if (user) {
      return res.status(400).json({ msg: "email is already registered" });
    }
  });

  //the data is valid

  let newUser = new User({
    username,
    password,
    confirm_password,
    email,
  });

  //hashing pasword
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;

      newUser.password = hash;
      newUser.save().then((user) => {
        return res
          .status(201)
          .json({ success: true, msg: "User is now registerd " });
      });
    });
  });
});

//login

router.post("/login", (req, res) => {
  User.findOne({ username: req.body.username }).then((user) => {
    if (!user) {
      return res.status(404).json({
        msg: "username not found ",
        sucesss: false,
      });
    }
    // if there is user we will confirm password

    bcrypt.compare(req.body.password, user.password).then((isMatch) => {
      if (isMatch) {
        const payload = {
          _id: user._id,
          username: user.username,
          email: user.email,
        };
        jwt.sign(payload, key, { expiresIn: 604800 }, (err, token) => {
          res.status(200).json({
            success: true,
            token: `Bearer ${token}`,
            user: user,
            msg: "you are now logged in",
          });
        });
      } else {
        return res.status(404).json({
          msg: "incorrect password ",
          sucesss: false,
        });
      }
    });
  });
});

//profile

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return res.json({
      user: req.user,
    });
  }
);

module.exports = router;
