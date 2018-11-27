var express = require('express'),
    router = express.Router(),
    moment = require('moment');

var Psychologist = require('../models/psychologist'),
    Request = require('../models/request'),
    SessionHistory = require('../models/sessionhistory');

router.get("/", isPsyLoggedIn, function (req, res) {
    Psychologist.findOne({ username: req.user.username }, function (err, psy) {
        if (err) {
            console.log(err);
        } else {
            res.render("scheduleps", { psychologist: psy })
        }
    })
});

router.post("/", isPsyLoggedIn, function (req, res) {
    Psychologist.findOne({ username: req.user.username }, function (err, psy) {
        if (err) {
            console.log(err);
        } else {
            if (!Array.isArray(psy.schedule) || !psy.schedule.length) {
                var newS = [{
                    start: req.body.startTime,
                    end: req.body.endTime
                }]
                psy.schedule = newS;
            } else {
                var newS = {
                    start: req.body.startTime,
                    end: req.body.endTime
                }
                psy.schedule.push(newS);
            }
            console.log(psy);
            psy.markModified('schedule')
            psy.save();
        }
        res.redirect("/");
    });
});

router.get("/requests", function (req, res) {
    Request.find({}, function (err, allRequests) {
        if (err) {
            console.log(err);
        } else {
            res.render("requests", { requests: allRequests, moment: moment });
        }
    });
});

router.get("/sessionhistory", function (req, res) {
    SessionHistory.find({}, function (err, allSessionHistory) {
        if (err) {
            console.log(err);
        } else {
            res.render("sessions", { sessions: allSessionHistory });
        }
    });
});

router.post("/sessionhistory", function (req, res) {
    if (req.body.completed == "Completed") {
        Request.findById(req.body.rid, function (err, r) {
            if (err) {
                console.log(err);
            } else {
                var sh = {
                    psychologist: r.psychologist,
                    student: r.student,
                    type: r.type,
                    startTime: r.date,
                    endTime: moment().format(),
                    remark: ""
                }
                console.log(sh);
                Psychologist.findOne({ name: sh.psychologist }, function (err, found) {
                    if (err) {
                        console.log(err);
                    } else {
                        found.schedule.forEach(function (s, i) {
                            console.log(s.start);
                            console.log(sh.startTime);
                            if (moment(s.start).isSame(sh.startTime)) {
                                console.log("splicing", found.schedule.splice(i, 1));
                                found.markModified('schedule');
                                found.save();
                            }
                        });
                        SessionHistory.create(sh, function (err, newSH) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("log    : new session history is made,", newSH);
                            }
                        });
                        Request.findByIdAndDelete(req.body.rid, function (err, dr) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.redirect('back');
                            }
                        });
                    }
                });
            }
        });
    }
});

function isPsyLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/psychologist/login");
}

module.exports = router;