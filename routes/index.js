var express = require("express");
const DockYARDMODAL = require("./dockyard");
const TrainMODAL = require("./Train");
const PNRMODAL = require("./PNR");
const UserModel = require("./users");
const passport = require("passport");
const bcrypt = require("bcrypt");
require("./PassportConfig");

var router = express.Router();

/* GET home page. */
router.get("/", async function (req, res) {
  let user;
  try {
    user = await UserModel.findOne({ email: req.session.passport.user });
  } catch (error) {}
  res.render("index", { user });
});

// get Logout

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
router.get("/ticketBook", isLoggedIn, async function (req, res, next) {
  let user;
  try {
    user = await UserModel.findOne({ email: req.session.passport.user });
  } catch (error) {}
  let trains = await TrainMODAL.find();

  res.render("TicketBooking", { trains, user });
});

router.get("/Login", function (req, res, next) {
  res.render("Login");
});
router.get("/PNR", async function (req, res, next) {
  let user;
  try {
    user = await UserModel.findOne({ email: req.session.passport.user });
  } catch (error) {}
  res.render("PNR", { user });
});
router.get("/Admin", async function (req, res, next) {
  let user;
  try {
    user = await UserModel.findOne({ email: req.session.passport.user });
  } catch (error) {}
  let PNRs = await PNRMODAL.find();
  res.render("ADMIN/adminHome", { user, PNRs });
});
router.get("/registerTrain", async function (req, res, next) {
  let user;
  try {
    user = await UserModel.findOne({ email: req.session.passport.user });
  } catch (error) {}
  let { BogiesQuantity, trainName, Motormans, Assistant } =
    await DockYARDMODAL.findOne({ _id: "62d92896992c63a9a41ff61b" });
  res.render("ADMIN/registerTrain", {
    BogiesQuantity,
    trainName,
    Motormans,
    Assistant,
    user,
  });
});

router.get("/TrainList", async function (req, res) {
  let user;
  try {
    user = await UserModel.findOne({ email: req.session.passport.user });
  } catch (error) {}
  let trains = await TrainMODAL.find();
  res.render("ADMIN/TrainList", { trains, user });
});

router.get("/AllTickets", isLoggedIn, async function (req, res) {
  let user = await UserModel.findOne({
    email: req.session.passport.user,
  }).populate("Tickets");
  res.render("AllTickets", { user });
});
router.get("/PNRStatus", async function (req, res) {
  let user;
  try {
    user = await UserModel.findOne({ email: req.session.passport.user });
  } catch (error) {}
  let PNR = await PNRMODAL.findOne({ _id: req.query.PNR });
  res.render("Pnrstatus", { PNR, user });
});
router.get("/checkavailable", async function (req, res) {
  let user;
  try {
    user = await UserModel.findOne({ email: req.session.passport.user });
  } catch (error) {}
  let trains = await TrainMODAL.find();
  res.render("checKAvailable", { trains, user });
});
router.get("/availableSeat", async function (req, res) {
  let user;
  try {
    user = await UserModel.findOne({ email: req.session.passport.user });
  } catch (error) {}
  let trains = await TrainMODAL.findOne({ trainName: req.query.TrainName });
  res.render("AvailableSeats", { trains, user });
});

router.post(
  "/signup",
  async (req, res, next) => {
    let user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      res.redirect(req.headers.referer);
    } else {
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(req.body.password, salt);
      user = new UserModel({
        name: req.body.name,
        email: req.body.email,
        number: req.body.number,
        password: hash,
      });
      try {
        await user.save();
      } catch (error) {}
    }

    next();
  },
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/Login",
  })
);
//post Login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/Login",
  })
);
router.post("/ticketBooking", async (req, res) => {
  let ticket = await PNRMODAL.create(req.body);
  req.body.TicketQuantity = parseInt(req.body.TicketQuantity);
  let train = await TrainMODAL.findOne({ trainName: req.body.TrainName });
  let user = await UserModel.findOne({ email: req.session.passport.user });
  user.Tickets.push(ticket._id);
  train.Ticket.assign += req.body.TicketQuantity;
  train.Ticket.available -= req.body.TicketQuantity;
  await user.save();
  await train.save();
  res.render("Pnrstatus", { PNR: ticket, user });
  // res.redirect(req.headers.referer);
});
router.get("/cancelTicket", async (req, res) => {
  let ticket = await PNRMODAL.findOneAndDelete({ _id: req.query.PNR });
  let train = await TrainMODAL.findOne({ trainName: ticket.TrainName });
  let user = await UserModel.findOne({ email: req.session.passport.user });
  user.Tickets.splice(user.Tickets.indexOf(ticket._id), 1);
  train.Ticket.assign -= ticket.TicketQuantity;
  train.Ticket.available += ticket.TicketQuantity;
  await user.save();
  await train.save();
  res.redirect("/AllTickets");
});
router.post("/registerTrain", async function (req, res, next) {
  try {
    req.body.Bogies = parseInt(req.body.Bogies);
    let dockyard = await DockYARDMODAL.findOne({
      _id: "62d92896992c63a9a41ff61b",
    });
    let trainseat = req.body.Bogies * 100;
    let trainset = {
      ...req.body,
      Ticket: { total: trainseat, available: trainseat },
    };
    try {
      let user = await TrainMODAL.create(trainset);
    } catch (error) {}

    dockyard.BogiesQuantity.assign += req.body.Bogies;
    dockyard.BogiesQuantity.available -= req.body.Bogies;
    dockyard.trainName = dockyard.trainName.map((train) => {
      if (train.name === req.body.trainName) {
        train.available = false;
      }
      return train;
    });
    dockyard.Motormans = dockyard.Motormans.map((Motorman) => {
      if (Motorman.name === req.body.Motorman) {
        Motorman.available = false;
      }
      return Motorman;
    });
    dockyard.Assistant = dockyard.Assistant.map((assistant) => {
      if (assistant.name === req.body.Assistant) {
        assistant.available = false;
      }
      return assistant;
    });
    await dockyard.save();
    req.body.Ticket = {
      total: req.body.Bogies * 100,
    };

    res.redirect(req.headers.referer);
  } catch (error) {}
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}
module.exports = router;
