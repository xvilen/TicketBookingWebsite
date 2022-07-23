var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const expresSession = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();
const sessionStore = new MongoStore({
  mongoUrl: "mongodb://localhost:27017/gazick",
  collectionName: "session",
});
app.use(
  expresSession({
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    secret: "gazick",
    cookie: {
      maxAge: 24 * 60 * 60 * 100,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
