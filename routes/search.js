var express = require('express'),
    router = express.Router();

router.get("/",function (req,res) {
    res.render('search.ejs',{title: "Research API"});
  });

module.exports = router;