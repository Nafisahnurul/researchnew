var express = require('express'),
    request = require('request'),
    router = express.Router();

router.get("/",function (req,res) {
    res.render('search.ejs',{title: "Research API"});
});

router.post("/result", function(req,res){
    let keyword = req.body.keyword;
    /*
    let url1 = 'http://www.pathwaycommons.org/pc/webservice.do?version=2.0&q='+keyword+'&format=xml&cmd=search';
    console.log(keyword);
    console.log(url1);
    request(url1,function(error, response, body){
        console.log(body);
    })*/
    let i=0;
    let temp ="";
    let url2 = 'http://www.sherpa.ac.uk/romeo/api29.php?jtitle=';
    for (i=0;i<keyword.length;i++) {
        if (keyword[i]==' ') {
            url2=url2+temp+'%20';
            temp=""; 
        } else {
            temp=temp+keyword[i];
            if (i==keyword.length-1) {
                url2=url2+temp+'&qtype=contains';
            }
        }
    }
    console.log(url2);
    request(url2,function(error, response, body){
        parse(body, result);
        console.log(result.header);
    })
})
module.exports = router;