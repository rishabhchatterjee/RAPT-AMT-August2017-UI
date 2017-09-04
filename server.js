var express = require("express");

var app = express();

var router = express.Router();
var path = __dirname + 'views/';
var jsonPath = '/users/';


router.use(function (req,res,next) {
    console.log("/" + req.method);
    next();
});

// router.get("/main",function(req,res){
//   res.sendFile(path + "index.html");
// });
//
// router.get("/question",function(req,res){
//   res.sendFile(path + "question.html");
// });
//
// router.get("/quiz_corrections",function(req,res){
//   res.sendFile(path + "quiz_corrections.html");
// });
//
// router.get("/start",function(req,res){
//   res.sendFile(path + "start.html");
// });

app.use("/",router);

app.use(express.static(__dirname + '/views'));

app.listen(process.env.PORT || 8000,function(){
    console.log("Live at Port 8000");
});
