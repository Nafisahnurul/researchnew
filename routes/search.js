var express = require('express'),
    request = require('request'),
    router = express.Router();

router.get("/",function (req,res) {
    res.render('search.ejs',{title: "Research API"});
});

router.post("/result", function(req,res){
    let keyword = req.body.keyword;
    let url = 'http://www.pathwaycommons.org/pc/webservice.do?version=2.0&q='+keyword+'&format=xml&cmd=search';
    console.log(keyword);
    console.log(url);
    request(url,function(error, response, body){
        console.log(body);
    })
})
module.exports = router;