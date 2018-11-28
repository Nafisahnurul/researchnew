var express = require('express'),
    router = express.Router(),
    moment = require('moment'),
    request = require('request'),
    parseXML = require('xml2js').parseString,
    stripNS = require('xml2js').processors.stripPrefix;

var Psychologist = require('../models/psychologist'),
    Student = require('../models/student'),
    Request = require('../models/request');

router.get("/login", function (req, res) {
    if (!isEmpty(req.cookies)) {
        res.send("cookie detected");
    } else {
        if (req.query.ticket) {
            var service = "service=" + encodeURI("https://" + req.headers.host + "/student/login");
            var ticket = "ticket=" + req.query.ticket;
            request("https://login.itb.ac.id/cas/serviceValidate?" + service + "&" + ticket, function (err, response, body) {
                if (err) {
                    console.log(err);
                } else {
                    parseXML(body, { tagNameProcessors: [stripNS] }, function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (result.serviceResponse.authenticationSuccess && result.serviceResponse.authenticationSuccess.length) {
                                var newStudent = {
                                    name: result.serviceResponse.authenticationSuccess[0].attributes[0].cn,
                                    nim: result.serviceResponse.authenticationSuccess[0].attributes[0].itbNIM[0],
                                    prodi: result.serviceResponse.authenticationSuccess[0].attributes[0].ou[0],
                                    email: result.serviceResponse.authenticationSuccess[0].attributes[0].mail[0],
                                    message: ""
                                }
                                Student.findOne({ nim: newStudent.nim }, function (err, found) {
                                    if (err) {
                                        console.log(err);
                                    } else if (!found) {
                                        Student.create(newStudent, function (err, newStudent) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log("log    : Mahasiswa baru ditambahkan ke dalam database", newStudent.nim);
                                                req.session.user = newStudent;
                                                res.redirect("/");
                                            }
                                        });
                                    } else {
                                        req.session.user = found;
                                        res.redirect("/student/services");
                                    }
                                })
                            } else {
                                res.redirect("/student/login");
                            }
                        }
                    });
                }
            });
        } else {
            res.redirect(encodeURI("https://login.itb.ac.id/cas/" + "login?service=" + "https://" + req.headers.host + "/student/login"))
        }
    }
});

router.get("/logout", function (req, res) {
    res.clearCookie('user_sid');
    res.redirect("/");
});

router.get("/services", isLoggedIn, function (req, res) {
    Psychologist.find({}, function (err, allPyschologists) {
        if (err) {
            console.log(err);
        } else {
            res.render("services", { moment: moment, user: req.session.user, psychologists: allPyschologists });
        }
    });
});

router.post("/services", isLoggedIn, function (req, res) {
    req.body.request.date = moment(req.body.request.date, "HH:mm MM-DD-YYYY").toDate();
    console.log(req.body.request);

    Psychologist.find({}, function (err, allPyschologists) {
        var leastBusy;
        if (err) {
            console.log(err);
        } else {
            //Find available psychologist
            var leastLength = 50;
            allPyschologists.forEach(function (eachPsychologist) {
                eachPsychologist.schedule.forEach(function (eachPsychologistSchedule) {
                    if (moment(req.body.request.date).isBetween(eachPsychologistSchedule.start, eachPsychologistSchedule.end)) {
                        eachPsychologist.available = false
                    }
                })
                if (typeof (eachPsychologist.available) == "undefined") {
                    if (eachPsychologist.schedule.length < leastLength) {
                        leastLength = eachPsychologist.schedule.length;
                        leastBusy = eachPsychologist;
                    }
                }
            });
        }
        //Create new request
        var newRequest = req.body.request;
        newRequest.psychologist = leastBusy.name;
        Request.create(newRequest, function (err, request) {
            if (err) {
                console.log(err);
            } else {
                console.log(request);
            }
        });

        //Add request to the psychologist's schedule. 
        Psychologist.findOne({ username: leastBusy.username }, function (err, found) {
            if (err) {
                console.log(err);
            } else {
                var addSchedule = {
                    start: req.body.request.date,
                    end: moment(req.body.request.date).add(2, "h")
                }
                found.schedule.push(addSchedule);
                found.save();
            }
        });

        res.redirect("/student/services");
    });
});

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

function isLoggedIn(req, res, next) {
    if (req.cookies.user_sid && req.session.user) {
        return next();
    }
    res.redirect("/student/login");
}

module.exports = router;