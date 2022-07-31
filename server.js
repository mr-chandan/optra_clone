const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql2');
const bodyparser = require("body-parser");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const crypto = require('crypto');
const flash = require('express-flash');

const app = express()

app.use(flash());
app.use(express.static('public'))  //uses files imgs in public folder
app.set('view engine', 'ejs') //setting view engine
app.use(express.urlencoded({ extended: false }))
app.use(bodyparser.json());  //setting app to use body parser

const mysqlConnection = require("./data/sql-model")
const secutity = require('./auth/guest')

app.use(session({
  secret: "ram",
  resave: false,
  saveUninitialized: false
}))

const init = require("./auth/passport-config")
init(passport);
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
  res.render('login')
})

app.post('/', passport.authenticate('local-login', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('/home');
  });



app.get('/home', secutity, (req, res) => {
  mysqlConnection.query("SELECT * FROM users i INNER JOIN attendance a ON i.id = a.attid where i.id=?;", [req.user], (err, rows) => {  ///we got req.user.optraid from passport
    if (!err) {
      console.log(rows)
      res.render('home', {rows: rows})
    } else {
      console.log(err);
    }
  })
})

app.get('/stddetails', (req, res) => {
  mysqlConnection.query("SELECT * FROM users ;",(err, rows) => {
    if (!err) {
      console.log(rows)
      res.render('stddetails', {rows: rows})
    } else {
      console.log(err);
    }
  })
})


app.listen(3000, () => {
  console.log("connected to port 3000")
})


// mysqlConnection.query("select * from login;", (err, rows, fields) => {
//     if (!err) {
//         res.send(rows)
//     } else {
//         console.log(err);
//     }
// })



