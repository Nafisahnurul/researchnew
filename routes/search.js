var express = require('express'),
    router = express.Router();

router.get("/",function (req,res) {
    res.render('search.ejs',{title: "Research API"});
});

router.post("/result", function(req,res){
    let keyword = req.body.keyword;
    console.log(keyword);
})
module.exports = router;