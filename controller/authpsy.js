var express = require('express'),
    router = express.Router(),
    passport = require('passport');

var Psychologist = require('../models/psychologist');

router.get("/register", function (req, res) {
    res.render("registerps");
});

router.post("/register", function (req, res) {
    Psychologist.register(new Psychologist({ username: req.body.a.name, name: req.body.a.name, id: req.body.a.id }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/psychologist/request");
        });
    });
});

router.get("/login", function (req, res) {
    if (req.isAuthenticated()) {
        res.send("already login");
    } else {
        res.render("loginps");
    }
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/psychologist/request",
    failureRedirect: "/psychologist/login",
}), function (req, res) {
});

module.exports = router;