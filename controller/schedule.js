var express = require('express'),
    router = express.Router(),
    moment = require('moment');

var Psychologist = require('../models/psychologist'),
    Request = require('../models/request'),
    Student = require('../models/student'),
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
                    end: req.body.endTime,
                    type: "self"
                }]
                psy.schedule = newS;
            } else {
                var newS = {
                    start: req.body.startTime,
                    end: req.body.endTime,
                    type: "self"
                }
                psy.schedule.push(newS);
            }
            console.log(psy);
            psy.markModified('schedule')
            psy.save();
        }
        res.redirect("/schedule/");
    });
});

router.get("/requests", isPsyLoggedIn, function (req, res) {
    Request.find({ psychologist: req.user.username }, function (err, allRequests) {
        if (err) {
            console.log(err);
        } else {
            res.render("requests", { requests: allRequests, moment: moment });
        }
    });
});

router.get("/sessionhistory", isPsyLoggedIn, function (req, res) {
    SessionHistory.find({ psychologist: req.user.username }, function (err, allSessionHistory) {
        if (err) {
            console.log(err);
        } else {
            res.render("sessions", { sessions: allSessionHistory });
        }
    });
});

router.post("/sessionhistory", isPsyLoggedIn, function (req, res) {
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
                Psychologist.findOne({ name: sh.psychologist }, function (err, found) {
                    if (err) {
                        console.log(err);
                    } else {
                        found.schedule.forEach(function (s, i) {
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
                                res.redirect('/schedule/sessionhistory');
                            }
                        });
                    }
                });
            }
        });
    } else if (req.body.cancel == "Cancel") {
        Request.findByIdAndDelete(req.body.rid, function (err, dr) {
            if (err) {
                console.log(err);
            } else {
                Psychologist.findOne({ name: dr.psychologist }, function (err, found) {
                    if (err) {
                        console.log(err);
                    } else {
                        found.schedule.forEach(function (s, i) {
                            if (moment(s.start).isSame(dr.start)) {
                                console.log("splicing", found.schedule.splice(i, 1));
                                found.markModified('schedule');
                                found.save();
                            }
                        });
                        Student.findOne({ name: dr.student }, function (err, stud) {
                            if (err) {
                                console.log(err);
                            } else {
                                stud.message = moment().calendar() + "    : Permintaan layanan anda untuk " + dr.type + " pada " + moment(dr.date).calendar() + " telah dibatalkan, silakan melakukan permohonan layanan lagi";
                            }
                        });
                    }
                    res.redirect('/schedule/sessionhistory');
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