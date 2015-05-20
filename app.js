var express = require('express'),
	app = express(),
	http = require("http"),
	https = require("https"),
	request = require('request'),
	path = require('path');

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	res.render('index', { title: 'issuu maze'});
});

app.get('/query', function(req, res){
	var query = req.url.split('/query?')[1];
	request('http://search.issuu.com/api/2_0/document?' + query + '&responseParams=%2A', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    res.send(body);
	  }
	});
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
