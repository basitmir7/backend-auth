const express = require("express");

const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const passport = require("passport");

const app = express();

//form data middleware
app.use(bodyParser.urlencoded({ extended: false }));

//json body middleware
app.use(bodyParser.json());

app.use(cors());

//use passport

app.use(passport.initialize());

//bring strategy
require("./config/passport")(passport);

//stastic directory
app.use(express.static(path.join(__dirname, "src")));

//bring database congfig
const db = require("./config/keys").mongoURI;

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`database connected ${db}`);
  })
  .catch((err) => console.log(`unable to connect to db ${db}`));

app.get("/", (req, res, next) => {
  res.json({ appname: "KASHMIRFRESH" });
});

//bring user route
const users = require("./api/users");
//const router = require("./api/users");

app.use("/api/users", users);

const port = process.env.PORT || 5000;

app.listen(port, (err) => {
  if (err) return console.log(err);
  console.log("server running on port" + port);
});
