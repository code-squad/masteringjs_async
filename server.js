const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const shortid = require('shortid')
const session = require('express-session')  


app.listen(3000, function() {
	console.log("start, express server on port 3000");
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:8080");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'keyboard cat',
    cookie: { maxAge: 60000 }
}))

const jsonParser = bodyParser.json()
//Routing
app.post('/api/login', jsonParser,  function(req, res){
    const user  = req.body.user;
    if(user) {
        req.session.userid = user;
        res.json({ "login" : "ok" });
    } else {
        res.json({ "login" : "fail" });
    }

});

app.post('/api/logging', jsonParser,  function(req, res){
    const logType = req.body.logType;
    console.log("[logging]", logType)
    res.json({'loggin':'ok'})
});


app.post('/api/questions/:questionid/answers', jsonParser,  function(req, res){
    if(!req.session.userid)  res.status(401)

    const questionId = req.params.questionid;
    const body = req.body;
    if(!body) res.json({"error" : 400});

    console.log("[post] : ", body.content);

	res.json({
        "answerId" : shortid.generate(),
        "questionId" : questionId,
        "content" : body.content,
        "date" : "2018-08-11",
        "writer" : {
            "id" : "crong"
        }
    })
})

app.delete('/api/session', jsonParser,  function(req, res){
    const command = req.body.command;
    if(command === "deletesession") req.session.destroy();
    res.json({'result':'ok'})
});

app.delete('/api/questions/:questionid/answers/:answerid', function(req,res) {
    const answerid = req.params.answerid;
    console.log("[delete]", answerid);
    res.json({'answerid' : answerid})
});
