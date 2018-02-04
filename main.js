var express = require('express')
var fs = require('fs')

var app = express()

app.set('views', __dirname + '/frontend/views')
app.set('view engine','jade')

app.get('/',(req,res) => {
  res.render("index")
})

app.get('/css/:name.css',(req,res) => {
  res.sendFile(__dirname+"/frontend/css/"+req.params.name+".css")
})

app.get('/lib/:name.js',(req,res) => {
  res.sendFile(__dirname+"/frontend/js/lib/"+req.params.name+".js")
})

app.get('/js/:name.js',(req,res) => {
  res.sendFile(__dirname+"/frontend/js/"+req.params.name+".js")
})

app.get('/tiles/webp/:zoom/:name.webp',(req,res) => {
  res.sendFile(__dirname+"/frontend/tiles/webp/"+req.params.zoom+"/"+req.params.name+".webp")
})
app.get('/img/:name.:ext',(req,res) => {
  res.sendFile(__dirname+"/frontend/img/"+req.params.name+"."+req.params.ext)
})


app.get('/data/:name.json',(req,res) =>{
  fs.readFile(__dirname+"/data/"+req.params.name+".json",(e,s) => {
    res.send(s)
  })
})

app.listen(80)