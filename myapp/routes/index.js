var express = require('express');
var router = express.Router();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET user location. */
router.get('/userloc', function (req, res) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "http://ip-api.com/json", false);
  xmlhttp.send();
  if(xmlhttp.readyState === 4 && xmlhttp.status === 200){
    var loc = JSON.parse(xmlhttp.responseText);
    res.send(loc);
  } else {
    res.send("Not Found")
  }
});

/* GET city autocomplete. */
router.get('/cityauto', function (req, res) {
  var xmlhttp = new XMLHttpRequest();
  var apikey = "AIzaSyAFL3mwNWBsgsYdqTfcQsfRP8e60Vjda28";
  var url1 = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=";
  var url2 = "&types=(cities)&lan guage=en&key=";
  var input = req.query['input'];
  xmlhttp.open("GET", url1 + input + url2 + apikey, false);
  xmlhttp.send();
  if(xmlhttp.readyState === 4 && xmlhttp.status === 200){
    var resJson = JSON.parse(xmlhttp.responseText);
    res.send(resJson);
  } else {
    res.send("Not Found")
  }
});

/* GET state seal. */
router.get('/stateseal', function (req, res) {
  var xmlhttp = new XMLHttpRequest();
  var apikey = "AIzaSyAFL3mwNWBsgsYdqTfcQsfRP8e60Vjda28";
  var engid = "003599467955550038192:eneitqk6ysv";
  var url1 = "https://www.googleapis.com/customsearch/v1?q=";
  var url2 = "%20State%20Seal&cx=";
  var url3 = "&imgSize=large&imgType=news&num=1&searchType=image&key=";
  var input = req.query['state'];
  xmlhttp.open("GET", url1 + input + url2 + engid + url3 + apikey, false);
  xmlhttp.send();
  if(xmlhttp.readyState === 4 && xmlhttp.status === 200){
    var resJson = JSON.parse(xmlhttp.responseText);
    res.send(resJson);
  } else {
    res.send("Not Found")
  }
});

/* GET search geocode. */
router.get('/search/geocode', function (req, res) {
  var xmlhttp = new XMLHttpRequest();
  var apikey = "AIzaSyAFL3mwNWBsgsYdqTfcQsfRP8e60Vjda28";
  var url1 = "https://maps.googleapis.com/maps/api/geocode/json?address=";
  var url2 = "&key=";
  var input = [req.query['street'], req.query['city'], req.query['state']].join("+");
  xmlhttp.open("GET", url1 + input + url2 + apikey, false);
  xmlhttp.send();
  if(xmlhttp.readyState === 4 && xmlhttp.status === 200){
    var resJson = JSON.parse(xmlhttp.responseText);
    res.send(resJson);
  } else {
    res.send("Not Found")
  }
});

/* GET search weather. */
router.get('/search/weather', function (req, res) {
  var xmlhttp = new XMLHttpRequest();
  var apikey = "e2520faa3b19b2ea6ff4bb4ee4cb89a8";
  var url1 = "https://api.darksky.net/forecast/";
  var url2 = "/";
  var input = req.query['lat'] + "," + req.query['lng'];
  if ('time' in req.query) {
    input += "," + req.query['time'];
  }
  xmlhttp.open("GET", url1 + apikey + url2 + input, false);
  xmlhttp.send();
  if(xmlhttp.readyState === 4 && xmlhttp.status === 200){
    var resJson = JSON.parse(xmlhttp.responseText);
    res.send(resJson);
  } else {
    res.send("Not Found")
  }
});

module.exports = router;
