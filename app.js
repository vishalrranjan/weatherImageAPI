require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set('view-engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname));

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB dagtabase connection established successfully.");
});

const weatherConditionSchema = new mongoose.Schema({
    weatherType: String,
    url: String
});

const Condition = mongoose.model("Condition", weatherConditionSchema);

app.get("/", (req, res)=>{
    res.sendFile(__dirname + '/index.html')
});

app.route("/imageapi")
.get(function(req, res){
    Condition.find({}, function(err, backgroundImage){
        if(!err){
            res.send(backgroundImage);
        } else{
            res.send(err);
        }
    });
})
.post(function(req,res){
    // console.log(req.body.weatherType);
    // console.log(req.body.url);

    const newWeather = new Condition({
        weatherType: req.body.weatherType,
        url: req.body.url
    });
    newWeather.save(function(err){
        if(!err){
            res.send("updated the data successfully.");
        } else{
            res.send(err);
        }
    });
});

// ****************************sending request using url param *************************************//

app.route("/imageapi/:weatherType")
.get(function(req, res){
    const weatherCondition = req.params.weatherType;

    Condition.find({weatherType: weatherCondition}, function(err, foundCondition){
        if(foundCondition){
            res.send(foundCondition);
        } else{
            res.send(err);
        }
    });
})
.patch(function(req, res){
    Condition.update(
        {weatherType: req.params.weatherType},
        {$set: req.body},
        function(err){
            if(!err){
                res.send("successfully update the api");
            } else{
                res.send(err);
            }
        }
    );
})
.delete(function(req, res){
    Condition.deleteOne( {weatherType: req.params.weatherType},
            function(err){
                if(!err){
                    res.send("successfully delete the data.");
                } else{
                    res.send(err);
                }
            }
        );
});

app.listen(3000, function(){
    console.log("App is listening on port 3000");
});