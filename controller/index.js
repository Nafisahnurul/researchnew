var express = require('express'),
    router = express.Router();


router.get("/", function(req, res){
    res.render("index");
});

router.get("/about", function(req, res){
    res.render("about");
})
