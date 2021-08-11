require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//const mySecret = process.env['MONGO_URI'];

const mySecret = "mongodb+srv://jensoni:KvvTNJgUr0LQP0JC@cluster0.9gvk4.mongodb.net/db1?retryWrites=true&w=majority\n";
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

let linkSchema = new mongoose.Schema({
  age: Number,
  name: {type: String, required: true}
})
let Linker = mongoose.model("Link", linkSchema);

app.post("/api/shorturl", (req,res)=>{
  let regex = /^http:\/\/|^https:\/\//g;
  let currNum = -1;
  let uri = req.body.url;
  if(regex.test(uri)){
    Linker.findOne({}).sort({age:'desc'}).exec((err, data) =>{
      if(!err){
        if(data==null){currNum=1}
        else{currNum = data.age + 1;}
        Linker.findOneAndUpdate({name:uri}, {name:uri, age:currNum}, {new:true, upsert:true},(err,data)=>{
          if(err){
            res.send("error");
          }
          else{
            res.json({original_url : uri, short_url : currNum})
          }
        })
      }
      else{
        res.send(err);
      }
    })
  }
  else{
    res.json({error: 'invalid url'})
  }
})

app.get("/api/shorturl/:short", (req,res)=>{
  let short = req.params.short;
  let regex = /^\d+/g;
  if(regex.test(short)){
    // res.send(short)
    Linker.findOne({age:short},(err,data)=>{
      if(!err && data!=null){
        console.log("here",data.name);
        res.redirect(data.name)
      }
      else{
        res.send("Data not found")
      }
    })
  }
  else{
    res.send("Data not found")
  }
})

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
