var express = require('express'),
    router = express.Router();


Router.get("/", function(req, res){
    res.render("index");
});

Router.get("/about", function(req, res){
    res.render("about");
})
