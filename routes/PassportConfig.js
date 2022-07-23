const passport = require("passport");
const usersModel = require("./users");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { validate } = require("./users");

passport.serializeUser((user, done) => {
  done(null, user.email);
});
passport.deserializeUser(async (email, done) => {
  let user = await usersModel.findOne({ email });
  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
});

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      let user = await usersModel.findOne({ email: email });
      console.log(user);
      if (!user) {
        return done(null, false);
      }
      try {
        const Validate = await bcrypt.compare(password, user.password);
        if (Validate) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (error) {
        done(null, false);
      }
    }
  )
);
