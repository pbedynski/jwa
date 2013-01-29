//Server 
var 	
	fs = require('fs')
	, path = require('path')
	, restify = require('restify')
	, zlib = require('zlib')
	, bunyan = require('bunyan');

var port = process.argv[2] || 8081;
var timeoutInterval = 50000; //10 seconds


var log = bunyan.createLogger({
  name: 'my_restify_application',
  level: process.env.LOG_LEVEL || 'info',
  stream: process.stdout,
  serializers: bunyan.stdSerializers
});

var server = restify.createServer({
	name: 'JWA dynamic server',
	log: log,
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.throttle({
  burst: 100,
  rate: 50,
  ip: true, // throttle based on source ip address
  overrides: {
    '127.0.0.1': {
      rate: 0, // unlimited
      burst: 0
    }
  }
}));

var data = {};

var safeParseJson = function(path) {
	try {
		return JSON.parse(require(path));
	} catch (err) {
		console.log(err);
		return [];
	}
}


var gzip, deflate;

var crawlData = function(){
	console.log("crawling data");
	var tmpData = {};
	tmpData.apartments = safeParseJson("../data/apartments/data.json");	
	data = tmpData;
	console.log(data);
	
	
	// console.log(data);
	// var input = new Buffer(JSON.stringify(tmpData), 'utf8')
	// zlib.gzip(input, function(err, result){
	// 	gzip = result;
	// 	// console.log("gzip: " + gzip);
	// });
	// zlib.deflate(input, function(err, result){
	// 	deflate = result;
	// 	// console.log("deflate: " + deflate);
	// });
	// setTimeout(function() {crawlData()}, timeoutInterval);
};

crawlData();


server.get('/data', getData);

function getData(req, res, next){
	console.log(data);
	res.send(200, {my : 'object'});
	// var acceptEncoding = req.headers['accept-encoding'] || '';
	// if (acceptEncoding.match(/\bgzip\b/)) {
	// 	// res.setHeader('Content-Encoding', 'gzip');
	// 	res.contentType = 'json';
	// 	res.send(200, data);
	// } else if (acceptEncoding.match(/\bdeflate\b/)) {
	// 	res.setHeader('Content-Encoding', 'deflate');
	// 	res.contentType = 'json';
	// 	res.send(200, deflate);
	// } else {
	// 	writelog('INFO', 'Returning data without compression\n');
	// 	res.contentType = 'json';
	// 	res.send(200, data);
	// }
	return next();
}


server.listen(port, function(){
	console.log("server listening on port %d", port);
});
