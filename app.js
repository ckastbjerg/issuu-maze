var express = require('express'),
    app = express(),
    http = require("http"),
    https = require("https"),
    request = require('request'),
    path = require('path');

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/query', function(req, res) {
    var query = req.url.split('/query?')[1];
    var req = 'http://search.issuu.com/api/2_0/document?' + query + '&responseParams=%2A';
    request(req, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        }
    });
});

app.get('/interests', function(req, res) {
    request('http://api.issuu.com/call/interests/list?lang=en', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        }
    });
});

//http://api.issuu.com/call/stream/api/iosinterest/1/0/initial?interestIds=105&seed=42&pageSize=10
app.get('/iosinterest', function(req, res) {
    var iosinterest = req.url.split('/iosinterest?q=')[1];
    request('http://api.issuu.com/call/stream/api/iosinterest/1/0/initial?interestIds=' + iosinterest + '&seed=42&pageSize=50', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        }
    });
});

app.get(['/', '/*'], function(req, res) {
    res.render('index', {
        title: 'issuu maze'
    });
});

var port = process.env.PORT || 3000;
var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});
