var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    mongoose = require('mongoose'),
    LocalStrategy = require('passport-local'),
    passport = require('passport');

var Psychologist = require('./models/psychologist'),
    User = require('./models/user');

var userAuth = require('./controller/userAuth')
    authPsyRoutes = require('./controller/authpsy'),
    stdRoutes = require('./controller/student'),
    scheduleRoutes= require('./controller/schedule'),
    indexRoutes   = require('./controller/index');

app.use(cookieParser());
app.use(require("express-session")({
    key: "user_researchapi",
    secret: "Researchapilocalgalocalharusnyabisa",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Psychologist.authenticate()));
passport.serializeUser(Psychologist.serializeUser());
passport.deserializeUser(Psychologist.deserializeUser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/views"));
app.set("view engine", "ejs");
mongoose.connect(process.env.database_uri || "mongodb://localhost/researchapi", { useNewUrlParser: true });

app.get("/", function (req, res) {
    res.render("index", { account: "" });
});

app.use("/", indexRoutes);
app.use("/userAuth", userAuth);
app.use("/student", stdRoutes);
app.use("/psychologist", authPsyRoutes);
app.use("/schedule", scheduleRoutes);

//LOGIN AND AUTH FOR PSYCHOLOGISTS

app.listen(process.env.PORT || 2000, function (req, res) {
    console.log("App is running");
    console.log("Database running: ", (process.env.database_uri || "mongodb://localhost/researchapi"))
})