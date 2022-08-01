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
app.use(express.urlencoded({ extended: true }))
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

app.post('/', passport.authenticate('local-login', { failureRedirect: '/' }), function (req, res) {
  res.redirect('/home');
});


app.get('/home', secutity, (req, res) => {
  mysqlConnection.query("SELECT * FROM users i INNER JOIN attendance a ON i.id = a.attid where i.id=?;", [req.user], (err, rows) => {  ///we got req.user.optraid from passport
    if (!err) {
      console.log(rows)
      res.render('home', { rows: rows })
    } else {
      console.log(err);
    }
  })
})

app.get('/takeatt', (req, res) => {
  mysqlConnection.query("SELECT * FROM users i INNER JOIN attendance a ON i.id = a.attid;", (err, rows) => {
    if (!err) {
      res.render('takeatt', { rows: rows })
    } else {
      console.log(err);
    }
  })
})

app.post('/takeatt', function (req, res) {
  console.log(req.body)
  const subject = req.body.subject
  const names = req.body.name
  var queries = '';
  names.forEach(name => {
    queries += mysqlConnection.format("UPDATE attendance SET " + subject + "=" + subject + "+1 where attid=" + name + ";");
  });
  mysqlConnection.query("UPDATE attendance SET t_" + subject + "=t_" + subject + "+1;", (err, rows) => {
    if (!err) {
      mysqlConnection.query(queries, (err, rows) => {
        if (!err) {
          res.redirect('/takeatt');
        } else {
          console.log(err);
        }
      })
    } else {
      console.log(err);
    }
  })
});

app.get('/att', (req, res) => {
  mysqlConnection.query("SELECT * FROM users i INNER JOIN attendance a ON i.id = a.attid;", (err, rows) => {
    if (!err) {
      console.log(rows)
      res.render('attendance', { rows: rows })
    } else {
      console.log(err);
    }
  })
})

app.listen(3000, () => {
  console.log("connected to port 3000")
})