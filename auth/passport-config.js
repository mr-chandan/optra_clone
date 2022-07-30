var LocalStrategy = require('passport-local').Strategy;
const mysqlConnection = require("../data/sql-model")

module.exports = function (passport) {

  passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    function (req, username, password, done) { // callback with email and password from our form

      mysqlConnection.query("SELECT * FROM `login` WHERE `optraid` = '" + username + "'", function (err, rows, fields) {
        if (err)
          return done(err);
        if (!rows.length) {
          return done(null, false, req.flash('loginMessage', 'User of password incorrect')); // req.flash is the way to set flashdata using connect-flash
        }
        // if the user is found but the password is wrong
        if (!(rows[0].password == password))
          return done(null, false, req.flash('loginMessage', 'User of password incorrect')); // create the loginMessage and save it to session as flashdata

        // all is well, return successful user
        return done(null, rows[0]);
      });

    }));

  passport.serializeUser(function (user, done) {
    done(null, user.optraid);
  });


  passport.deserializeUser(function (id, done) {
    mysqlConnection.query("select * from login where optraid = " + id, function (err, rows) {
      done(err, rows[0].optraid);
    });
  });

};


